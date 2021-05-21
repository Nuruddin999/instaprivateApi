import { IgApiClient } from 'instagram-private-api';
import BotApi from '../../BotApi';
export default (req, res) => {
  const IgApiClient = new BotApi()
  IgApiClient.twoFlogin(req.body.sms, req.body.identifier).then(r => res.status(200).json({ name: r })).catch(err => res.status(200).json({ name: err }))

}

