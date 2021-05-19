import { ErrorTwoF } from "./types/types";
import { AccountRepositoryLoginResponseLogged_in_user } from 'instagram-private-api';


export interface BotInterface {
    login(): Promise<AccountRepositoryLoginResponseLogged_in_user | ErrorTwoF>
}