import { spawn } from "child_process";

/**
 * Chat Agent - Uses Claude Code CLI to power an AI assistant
 * for the Interceptor Toolkit
 */

export interface ChatAction {
  type: "listSessions" | "showSession" | "startCapture" | "runScan" | "generateOpenAPI" | "runMock" | "analyze";
  params?: Record<string, unknown>;
}

export interface ChatResponse {
  message: string;
  action?: ChatAction;
  error?: string;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are an AI assistant for the Interceptor Toolkit, a network traffic capture and API analysis tool.

## Available Actions
You can help users by executing these actions (return them in your JSON response):

1. **listSessions** - List all capture sessions
   - No params needed

2. **showSession** - Show details of a session
   - params: { sessionId: string } (use "latest" for most recent)

3. **startCapture** - Guide user to start capturing traffic
   - params: { port: number, mode: "passive" | "active" }
   - NOTE: Capture runs in terminal, so provide the command for the user to run

4. **runScan** - Run security vulnerability scan on a session
   - params: { sessionId: string, severity?: "low" | "medium" | "high" | "critical" }

5. **generateOpenAPI** - Generate OpenAPI spec from captured traffic
   - params: { sessionId: string, format?: "yaml" | "json", includeExamples?: boolean }

6. **runMock** - Guide user to run mock server
   - params: { sessionId: string, port: number }
   - NOTE: Mock server runs in terminal, provide the command

7. **analyze** - Analyze traffic patterns
   - params: { sessionId: string, task: "summarize" | "endpoints" | "auth" }

## Response Format
Always respond with valid JSON:
{
  "message": "Your helpful response to the user",
  "action": { "type": "actionName", "params": { ... } }  // optional
}

## Guidelines
- Be concise and helpful
- If user wants to capture traffic, explain they need to run the capture command in a terminal
- For actions that can be executed via the API, include the action in your response
- If no action is needed (just answering a question), omit the action field
- If sessions don't exist yet, guide the user to start a capture first

## Example Responses

User: "list my sessions"
{"message": "Here are your capture sessions:", "action": {"type": "listSessions"}}

User: "scan the latest session for security issues"
{"message": "Running a security scan on your latest session...", "action": {"type": "runScan", "params": {"sessionId": "latest"}}}

User: "how do I start capturing?"
{"message": "To start capturing traffic, run this command in your terminal:\\n\\n\`interceptor capture --mode passive --port 8080\`\\n\\nThis starts a proxy on port 8080. Configure your app/browser to use localhost:8080 as a proxy, then make requests. Press Ctrl+C to stop and save the session."}

User: "what is this tool?"
{"message": "The Interceptor Toolkit helps you capture HTTP traffic, analyze APIs, find security vulnerabilities, and generate OpenAPI specs. Start by capturing some traffic, then you can scan it or generate documentation."}`;

/**
 * Check if Claude Code CLI is available (cross-platform)
 */
export async function checkClaudeCodeAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    // Use 'claude --version' instead of 'which' for cross-platform compatibility
    const proc = spawn("claude", ["--version"], { stdio: "ignore" });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

/**
 * Send a message to Claude Code CLI and get a structured response
 */
export async function sendChatMessage(
  userMessage: string,
  conversationHistory: ConversationMessage[] = []
): Promise<ChatResponse> {
  const isAvailable = await checkClaudeCodeAvailable();
  if (!isAvailable) {
    return {
      message: "Claude Code CLI is not installed. Please install it with: npm install -g @anthropic-ai/claude-code",
      error: "cli_not_found",
    };
  }

  // Build the full prompt with conversation history
  let prompt = SYSTEM_PROMPT + "\n\n";

  if (conversationHistory.length > 0) {
    prompt += "## Conversation History\n";
    for (const msg of conversationHistory.slice(-6)) { // Keep last 6 messages for context
      prompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    }
    prompt += "\n";
  }

  prompt += `## Current Request\nUser: ${userMessage}\n\nRespond with JSON only:`;

  return new Promise((resolve) => {
    let resolved = false;
    const safeResolve = (response: ChatResponse) => {
      if (resolved) return;
      resolved = true;
      resolve(response);
    };

    const claudeProcess = spawn("claude", ["--print"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    claudeProcess.stdin.write(prompt);
    claudeProcess.stdin.end();

    claudeProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    claudeProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    claudeProcess.on("close", (code) => {
      if (code !== 0) {
        safeResolve({
          message: "Sorry, I encountered an error processing your request.",
          error: stderr || "unknown_error",
        });
        return;
      }

      // Try to parse JSON from response
      try {
        // Claude might wrap response in markdown code blocks
        let jsonStr = stdout.trim();

        // Remove markdown code blocks if present
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        }

        // Try to find JSON object in response
        const jsonStart = jsonStr.indexOf("{");
        const jsonEnd = jsonStr.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
        }

        const parsed = JSON.parse(jsonStr);
        safeResolve({
          message: parsed.message || "I processed your request.",
          action: parsed.action,
        });
      } catch {
        // If JSON parsing fails, return the raw response as message
        safeResolve({
          message: stdout.trim() || "I'm not sure how to help with that.",
        });
      }
    });

    claudeProcess.on("error", (err) => {
      safeResolve({
        message: "Failed to communicate with Claude.",
        error: err.message,
      });
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      if (resolved) return;
      claudeProcess.kill("SIGTERM");
      safeResolve({
        message: "Request timed out. Please try again.",
        error: "timeout",
      });
    }, 60000);
  });
}
