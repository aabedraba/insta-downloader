"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const instagram_private_api_1 = require("instagram-private-api");
const ig = new instagram_private_api_1.IgApiClient();
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.IG_USERNAME || !process.env.IG_PASSWORD) {
        console.error("Environment variables are not defined!");
        process.exit(1);
    }
    ig.state.generateDevice(process.env.IG_USERNAME);
    yield ig.simulate.preLoginFlow();
    const loggedInUser = yield ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
    process.nextTick(() => __awaiter(void 0, void 0, void 0, function* () { return yield ig.simulate.postLoginFlow(); }));
    // Create UserFeed instance to get loggedInUser's posts
    const savedFeed = ig.feed.saved();
    const savedPosts = [];
    do {
        console.log("fetch");
        const mySavedItems = yield savedFeed.items();
        savedPosts.push(...mySavedItems);
    } while (yield savedFeed.isMoreAvailable());
    console.log("Total elements: ", savedPosts.length);
    process.exit(0);
});
main();
