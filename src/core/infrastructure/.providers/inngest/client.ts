import { Inngest } from "inngest";

const appId = process.env.INNGEST_APP_ID ?? "briom";

export const inngest = new Inngest({ id: appId });
export type InngestClient = typeof inngest;
