import { TavilySearch } from "@langchain/tavily";


const searchTool = new TavilySearch({ maxResults: 3 });

const tools = [searchTool]; 



export default tools;
