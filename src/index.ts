import { IgApiClient, SavedFeedResponseMedia } from "instagram-private-api";
import fs from "fs";
import axios from "axios";
import path from "path";

const ig = new IgApiClient();

const main = async () => {
  if (!process.env.IG_USERNAME || !process.env.IG_PASSWORD) {
    console.error("Environment variables are not defined!");
    process.exit(1);
  }

  ig.state.generateDevice(process.env.IG_USERNAME);

  await ig.simulate.preLoginFlow();
  const loggedInUser = await ig.account.login(
    process.env.IG_USERNAME,
    process.env.IG_PASSWORD
  );

  process.nextTick(async () => await ig.simulate.postLoginFlow());
  const savedFeed = ig.feed.saved();

  const savedPosts: SavedFeedResponseMedia[] = [];
  do {
    const mySavedItems = await savedFeed.items();
    savedPosts.push(...mySavedItems);
  } while (await savedFeed.isMoreAvailable());

  // please don't block me, instagram
  for (let index = 0; index < savedPosts.length; index++) {
    await downloadSavedPosts(savedPosts[index]);
  }

  process.exit(0);
};

const downloadSavedPosts = async (savedPost: SavedFeedResponseMedia) => {
  if (savedPost.carousel_media) {
    console.log("downloading carousel");
    const promises = savedPost.carousel_media.map(async (post, index) => {
      if (post.video_versions) {
        await downloadMedia(
          post.video_versions[0].url,
          savedPost.code + "-" + index,
          "video"
        );
      } else {
        await downloadMedia(
          post.image_versions2.candidates[0].url,
          savedPost.code + "-" + index,
          "picture"
        );
      }
    });

    await Promise.all(promises);
    console.log("finished carousel");
  } else {
    if (savedPost.video_versions) {
      await downloadMedia(
        savedPost.video_versions[0].url,
        savedPost.code,
        "video"
      );
    } else {
      await downloadMedia(
        savedPost.image_versions2!.candidates[0].url,
        savedPost.code,
        "picture"
      );
    }
  }
};

const downloadMedia = async (
  url: string,
  code: string,
  type: "video" | "picture"
) => {
  console.log("downloading " + type);
  const folder = type === "video" ? "videos" : "pictures";
  const extension = type === "video" ? ".mp4" : ".jpg";
  const filePath = path.resolve(
    __dirname.split("/src")[0],
    folder,
    code + extension
  );
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

main();
