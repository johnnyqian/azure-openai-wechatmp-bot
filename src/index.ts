import "dotenv/config";
import http from "http";
import crypto from "crypto";
import express from "express";
import xmlParser from "express-xml-bodyparser";
import { gptReply } from "./azure-openai-bridge.js";
//@ts-ignore import { getSimpleUnirest } from "./simple-unirest.js";

function textMessagePayload(args: {
  fromUserName: string;
  toUserName: string;
  content: string;
}): string {
  const xml = [
    "<xml><ToUserName><![CDATA[" + args.toUserName + "]]></ToUserName>",
    "<FromUserName><![CDATA[" + args.fromUserName + "]]></FromUserName>",
    "<CreateTime>" + new Date().getTime() + "</CreateTime>",
    "<MsgType><![CDATA[text]]></MsgType>",
    "<Content><![CDATA[" + args.content + "]]></Content></xml>",
  ].join("");
  return xml;
}

async function main() {
  const app = express();
  app.use(
    xmlParser({
      explicitArray: false,
      normalize: false,
      normalizeTags: false,
      trim: true,
    })
  );

  // const appId = process.env.OA_APP_ID;
  // const appSecret = process.env.OA_APP_SECRET;
  const token = process.env.OA_TOKEN;

  // const simpleUnirest = getSimpleUnirest("https://api.weixin.qq.com/cgi-bin/");

  // const ret = await simpleUnirest.get<{
  //   access_token: string;
  //   expires_in: number;
  // }>(`token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`);

  // console.info("accessToken", ret.body);

  // const accessToken = {
  //   token: ret.body.access_token,
  //   expiresIn: ret.body.expires_in,
  // };

  // 验证服务器地址的有效性
  app.get("/", (req, res) => {
    const { signature, timestamp, nonce, echostr } = req.query as {
      [key: string]: string;
    };
    const data = [timestamp, nonce, token].sort().join("");
    const digest = crypto.createHash("sha1").update(data).digest("hex");
    if (digest === signature) {
      res.end(echostr);
      console.info("echostr", echostr);
    } else {
      res.end();
    }
  });

  // 接收来自用户的消息
  app.post("/", async (req, res) => {
    const payload = req.body.xml;

    const prompt = payload.Content;
    console.info("prompt: ", prompt);

    var reply = await gptReply(prompt);
    console.info("reply: ", reply);

    // 被动回复用户的消息
    // 有5秒钟的响应时间要求，超过5秒则会重试三次，如果仍然无法响应则会出现错误提示
    // 该公众号提供的服务出现故障，请稍后再试
    const message = textMessagePayload({
      fromUserName: payload.ToUserName,
      toUserName: payload.FromUserName,
      content: reply,
    });

    // res.header("Content-Type", "application/xml");
    // res.status(200).send(message);

    res.type("xml");
    res.send(message);

    // 客服接口-异步回复消息，客服接口权限只有通过认证的公众号才能使用
    // https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Service_Center_messages.html
    // simpleUnirest
    //   .post<any>(`message/custom/send?access_token=${accessToken.token}`)
    //   .type("json")
    //   .send({
    //     msgtype: "text",
    //     text: {
    //       content: "dong",
    //     },
    //     touser: payload.FromUserName,
    //   })
    //   .then((ret) => {
    //     console.info(ret.body);
    //     res.end("success");
    //     return undefined;
    //   })
    //   .catch(console.error);
  });

  var server = http.createServer(app);
  server.listen(parseInt(process.env.PORT ?? "8000"), function () {
    var addressInfo = server.address() as { port: number };
    console.log("Bot listening at http://localhost:%s", addressInfo.port);
  });
}

main().catch(console.error);
