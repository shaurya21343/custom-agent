import { StateGraph, MessagesAnnotation,Annotation  } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { callModel } from "./model";
import tools from "./tool.js"

const GraphState = Annotation.Root({
  messages: Annotation<any[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

const shouldContinue = (state: typeof GraphState.State) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return "__end__";
};
const toolNode = new ToolNode(tools);



const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");
  
const app = workflow.compile();
export {app}