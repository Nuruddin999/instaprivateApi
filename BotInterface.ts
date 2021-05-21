import { ErrorTwoF } from "./types/types";
import { AccountRepositoryLoginResponseLogged_in_user, IgApiClient } from 'instagram-private-api';


export interface BotInterface {
    login(): Promise<IgApiClient | ErrorTwoF>
}