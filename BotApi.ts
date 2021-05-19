
import { config } from "dotenv";
import { IgApiClient, MediaRepositoryCommentResponse, AccountRepositoryLoginResponseLogged_in_user } from 'instagram-private-api';
import { BotInterface } from './BotInterface';
import { ErrorTwoF } from "./types/types";

export default class BotApi implements BotInterface {
    ig: IgApiClient;
    username: string;
    password: string;
    accountToParse: string = "mir_serebra_";
    usersToFollow: MediaRepositoryCommentResponse[];

    constructor(parameters) {
        config()
        this.username = process.env.USER
        this.password = process.env.PASS
        this.ig = new IgApiClient()
    }

    async login(): Promise<AccountRepositoryLoginResponseLogged_in_user | ErrorTwoF> {
        this.ig.state.generateDevice(this.username)
        await this.ig.simulate.preLoginFlow()
        const loggenInAccaunt = await this.ig.account.login(this.username, this.password).catch(err => {
            console.log(err)
            const { totp_two_factor_on, two_factor_identifier } = err.response.body.two_factor_info;
            return { totp_two_factor_on, two_factor_identifier }
        })
        console.log(JSON.stringify(loggenInAccaunt))
        return loggenInAccaunt
    }
    async twoFlogin(code, twoFactorIdentifier): Promise<AccountRepositoryLoginResponseLogged_in_user> {
        return this.ig.account.twoFactorLogin({ username: this.username, verificationCode: code, verificationMethod: 'SMS', twoFactorIdentifier, trustThisDevice: "1" })

    }

}