import Mailjet from "node-mailjet";
import { IEmailProvider } from "./email.interface";

export interface EmailjetConfig{
    apiKey: string;
    apiSecret: string;
    fromEmail: string;
    fromName: string;
}

export class MailjetEmailProvider implements IEmailProvider{
    private  client : Mailjet;
    private  fromEmail : string;
    private  fromName : string;

    constructor(private readonly config: EmailjetConfig){
        this.client = new Mailjet({
            apiKey: config.apiKey,
            apiSecret: config.apiSecret,
        });
        this.fromEmail = config.fromEmail;
        this.fromName = config.fromName; 
    }

    async send(to: string, subject: string, html: string): Promise<void> {
        
         await this.client.post('send',{ version: 'v3.1' })
        .request({
            Messages:[
                {
                    From:{
                        Email: this.fromEmail,
                        Name: this.fromName,
                    },
                    To:[{
                        Email: to
                    }],
                    Subject: subject,
                    HTMLPart: html
                }
            ]
        });

        
    }
}