// https://www.linkedin.com/pulse/calling-azure-openai-chatgpt-model-packages-nodejs-wong/
// https://github.com/1openwindow/azure-openai-node

import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  CreateChatCompletionRequest,
  OpenAIApi,
} from "azure-openai";

const apiKey = process.env.API_KEY;
const endpoint = process.env.ENDPOINT;
const deploymentName = process.env.DEPLOYMENT_NAME;

const openai = new OpenAIApi(
  new Configuration({
    azure: {
      apiKey: apiKey,
      endpoint: endpoint,
    },
  })
);

async function gptReply(prompt: string): Promise<string> {
  let messages: ChatCompletionRequestMessage[] = [
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: `You are an AI assistant that helps people find information.`,
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: prompt,
    },
  ];

  const request: CreateChatCompletionRequest = {
    model: deploymentName!,
    messages: messages,
    presence_penalty: 0,
    max_tokens: 800,
    temperature: 0.7,
    top_p: 0.95,
  };

  try {
    const response = await openai.createChatCompletion(request, {
      timeout: 4500,
    });
    return response.data.choices[0]!.message!.content;
  } catch (e) {
    console.error(e);
    return "发生了一些错误，请稍后再试。";
  }
}

export { gptReply };
