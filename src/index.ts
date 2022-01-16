import { IgApiClient } from "instagram-private-api";

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
  // Create UserFeed instance to get loggedInUser's posts
  const savedFeed = ig.feed.saved();

  const savedPosts: any[] = [];
  do {
    console.log("fetch");
    const mySavedItems = await savedFeed.items();
    savedPosts.push(...mySavedItems);
  } while (await savedFeed.isMoreAvailable());

  console.log("Total elements: ", savedPosts.length);

  process.exit(0);
};

main();
