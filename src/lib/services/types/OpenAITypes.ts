export interface OpenAIChatWithAssistantRequestParamsDto {
  role: string;
  content: string;
}

export interface OpenAIChatWithAssistantRequestDto {
  threadId: string;
  params: OpenAIChatWithAssistantRequestParamsDto;
}

