
import { config } from "dotenv";
import { IgApiClient, MediaRepositoryCommentResponse, AccountRepositoryLoginResponseLogged_in_user, UserFeedResponse, UserFeedResponseItemsItem, UserFeedResponsePreviewCommentsItem } from 'instagram-private-api';
import { BotInterface } from './BotInterface';
import { ErrorTwoF } from "./types/types";
import fs from "fs"

export default class BotApi implements BotInterface {
    ig: IgApiClient;
    username: string;
    password: string;
    userCookiePath = "cookies.json"
    userDevicePath = "device.json"
    accountToParse: string = "nozhi_kizlyar_imran";
    usersToFollow: MediaRepositoryCommentResponse[];

    constructor() {
        config()
        this.username = process.env.USER
        this.password = process.env.PASS
        this.ig = new IgApiClient()
    }
    async checkLogged() {
        this.ig.state.generateDevice(this.username)
        let cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"))
        let device = JSON.parse(fs.readFileSync("device.json", "utf8"))
        console.log("object lenght:   " + Object.keys(cookies).length)

        try {
            if (Object.keys(cookies).length > 0 && Object.keys(cookies).length > 0) {
                console.log('loading device and session from disk...')
                let savedCookie = fs.readFileSync(this.userCookiePath, 'utf-8')
                let savedDevice = fs.readFileSync("device.json", 'utf-8')
                await this.ig.state.deserializeCookieJar(savedCookie)
                this.ig.state.deviceString = JSON.parse(savedDevice).deviceString
                this.ig.state.deviceId = JSON.parse(savedDevice).deviceId
                this.ig.state.uuid = JSON.parse(savedDevice).uuid
                this.ig.state.adid = JSON.parse(savedDevice).adid
                this.ig.state.build = JSON.parse(savedDevice).build
            } else {
                const auth = await this.ig.account.login(this.username, this.password)
                const cookieJar = await this.ig.state.serializeCookieJar()
                fs.writeFileSync(this.userCookiePath, JSON.stringify(cookieJar), 'utf-8')
                let device = (({ deviceString, deviceId, uuid, adid, build }) => ({ deviceString, deviceId, uuid, adid, build }))(this.ig.state)
                fs.writeFileSync(this.userDevicePath, JSON.stringify(device), 'utf-8')
            }
        } catch (err) {
            console.error(err)
        }

    }
    async login(): Promise<IgApiClient | ErrorTwoF> {
        this.ig.state.generateDevice(this.username)
        await this.ig.simulate.preLoginFlow()
        const loggenInAccaunt = await this.ig.account.login(this.username, this.password).catch(err => {
            console.log(err)
            const { totp_two_factor_on, two_factor_identifier } = err.response.body.two_factor_info;
            this.ig.account.twoFactorLogin({ username: this.username, verificationCode: "here i paste my additional 8 number code in case when sms dont come", twoFactorIdentifier: two_factor_identifier, trustThisDevice: "1", verificationMethod: '1' }).then(r => r).catch(e => console.log("Result from 2 factor  " + e))
            return { totp_two_factor_on, two_factor_identifier }
        })
        return this.ig
    }
    async twoFlogin(code, twoFactorIdentifier): Promise<AccountRepositoryLoginResponseLogged_in_user> {
        console.log("username  " + this.username)
        console.log("code  " + code)
        console.log("identifier  " + twoFactorIdentifier)
        let result = await this.ig.account.twoFactorLogin({ username: this.username, verificationCode: code, twoFactorIdentifier, trustThisDevice: "1", verificationMethod: '1' }).catch(e => e)
        console.log("Result from 2 factor  " + result)
        return result

    }
    async getLatestPostLikers() {
        const id = await this.ig.user.getIdByUsername(this.accountToParse);
        const feed = await this.ig.feed.user(id);
        const posts = await feed.items();
    }
    async getPosts(): Promise<Array<UserFeedResponse>> {
        const id = await this.ig.user.getIdByUsername(this.accountToParse);
        const feed = await this.ig.feed.user(id);
        let posts = []
        let more_available = true
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
        }
        while (posts.length < 3 && more_available) {
            let newpost = await this.ig.feed.user(id).request().catch(err => err)
            posts.push(newpost);
            more_available = newpost.more_available
            console.log(newpost.status + " " + " " + newpost.more_available)
            await delay(4000)
        }
        return posts
    }
    async getIDs() {
        let previewComments = []
        let itemslist: string[] = []
        let comments: UserFeedResponsePreviewCommentsItem[]
        let posts = await this.getPosts()
        console.log(posts.length)
        posts.forEach(post => post.items.forEach(item => itemslist.push(item.id)))
        itemslist.forEach(item => console.log(item))
        return itemslist
        // console.log(previewComments.length)
        // previewComments.forEach(c => console.log(c.user.username))
    }
    async getCommentators() {
        let ids = await this.getIDs()
        for (const id of ids) {
            let comments = await this.ig.feed.mediaComments(id)
            let items = await comments.items()
            items.forEach(item => console.log(item.user.username))
        }
    }


}