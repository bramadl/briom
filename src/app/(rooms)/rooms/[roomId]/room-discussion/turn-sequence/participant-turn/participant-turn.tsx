"use client";

// import { format, parseISO } from "date-fns";

const TurnPerspectiveExpander = dynamic(
	() => import("../turn-perspective").then((m) => m.TurnPerspectiveExpander),
	{ ssr: false },
);

import type { RoomDTO, TurnDTO } from "@briom/app";
import { Badge } from "@briom/components/ui/badge";
import { cn } from "@briom/libs/utils";
import { PARTICIPANT_COLORS } from "@briom/rooms/rooms/mappings/participant-colors.map";
import dynamic from "next/dynamic";
import { TurnPerspective } from "../turn-perspective";
import { ParticipantTurnMenu } from "./participant-turn-menu";

const LONG_MARKDOWN = `
# The Future of AI Deliberation

This is the opening paragraph with some **important context**. We need to understand that *artificial intelligence* is reshaping how we approach complex problems.

## Core Concepts

### Section 1: Structured Reasoning
When multiple AI models collaborate in a guided discussion, several things happen:

1. **Perspective Diversity** - Different training data and architectures lead to varied viewpoints
2. **Iterative Refinement** - Responses build on prior turns, creating deeper analysis
3. **Moderation Benefits** - Human moderators ensure conversations stay on track

Here's some inline \`code: const result = await deliberate()\` that fits naturally in prose.

### Section 2: Technical Implementation

Let me show you a more complex example:

\`\`\`typescript
interface Turn {
  id: string;
  author: {
    type: "human" | "ai";
    name: string;
  };
  role: "system" | "user" | "assistant";
  content: string;
  createdAt: Date;
}

async function processTurn(turn: Turn): Promise<void> {
  // Logic here
  console.log(\`Processing turn from \${turn.author.name}\`);
}
\`\`\`

This implementation ensures clean separation of concerns.

## Advanced Topics

> **Note:** The following section contains advanced concepts that may require domain knowledge.

### Markdown Table Example

| Feature | Simple | Complex |
|---------|--------|---------|
| Speed | Fast | Slower |
| Flexibility | Limited | Extensive |
| Learning Curve | Shallow | Steep |

### Lists and Nested Items

- **Primary Topics**
  - Subtopic A with *emphasis*
  - Subtopic B with \`inline code\`
  - Subtopic C
- **Secondary Topics**
  - Another nested item
  - And another one

---

## Conclusion

In summary, structured AI deliberation combines:

1. **Multiple perspectives** from diverse models
2. **Human guidance** from moderators
3. **Iterative refinement** through turn-based exchanges

As we see from the table above, this approach offers *significant advantages* over traditional single-model responses.

For more details, check [the documentation](https://example.com/docs) or contact support.

\`\`\`python
# Example in Python
def summarize_deliberation(turns: List[Turn]) -> str:
    return "Summary of discussion"
\`\`\`

That's all folks! 🚀

–––

### Bash Example

\`\`\`bash
#!/bin/bash

# Deploy script with error handling
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "{BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="{PROJECT_DIR}/deploy.log"

echo "Starting deployment at $(date)" | tee -a "$LOG_FILE"

# Build
npm run build 2>&1 | tee -a "$LOG_FILE"

# Deploy
if [[ -f ".env.production" ]]; then
  source .env.production
  vercel deploy --prod
else
  echo "Error: .env.production not found" >&2
  exit 1
fi

echo "Deployment complete!" | tee -a "$LOG_FILE"
\`\`\`

### ZSH Configuration

\`\`\`zsh
# ~/.zshrc - ZSH configuration

# Aliases
alias ll='ls -lah'
alias dev='npm run dev'
alias build='npm run build'

# Functions
function git_branch() {
  git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "not a git repo"
}

# Prompt with git branch
PROMPT='%F{blue}%~%f %F{green}$(git_branch)%f %F{yellow}❯%f '

# History
HISTFILE=~/.zsh_history
HISTSIZE=50000
SAVEHIST=50000

# Completion
autoload -Uz compinit && compinit

# Vi keybindings
bindkey -v
\`\`\`

## Plain Text & Config Files

### Text File Example

\`\`\`txt
PROJECT TIMELINE
================

Q3 2026
-------
- Week 1-2: Architecture review
- Week 3-4: Implementation sprint
- Week 5-6: Testing & QA
- Week 7-8: Deployment prep

Q4 2026
-------
- Month 1: Production rollout
- Month 2: Monitoring & stabilization
- Month 3: Feature expansion

Notes:
  - Timeline assumes no blockers
  - Team: 3 engineers, 1 designer
  - Budget: allocated per quarter
\`\`\`

### Environment File

\`\`\`env
# .env.local - Development environment
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Briom Dev

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/briom_dev
DIRECT_URL=postgresql://user:pass@localhost:5432/briom_dev

# OpenRouter
OPENROUTER_API_KEY=sk-or-xxx...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Auth
BETTER_AUTH_SECRET=dev-secret-key-change-in-prod
BETTER_AUTH_URL=http://localhost:3000/api/auth

# Feature flags
ENABLE_STREAMING=true
DEBUG_MODE=false
\`\`\`

### Markdown as Content

\`\`\`markdown
# README.md from another repo

This is markdown being displayed as *code content*, not rendered.

## Usage

\`\`\`bash
npm install
npm run dev
\`\`\`

See the backtics? They're escaped in the code block!

- Bullet 1
- Bullet 2

And here's a [link](https://example.com) that won't be clickable.
\`\`\`

---

## Conclusion

Testing various language syntax highlighting helps ensure:

1. **Bash/ZSH** render properly with colors
2. **Plain text** and configs stay readable
3. **Nested code blocks** (markdown inside markdown) work
4. **Line numbers** (if enabled) display correctly

Try 'em out! 🚀
`;

interface ParticipantTurnProps {
	// participant: RoomDTO["participants"][number];
	// turn: TurnDTO;
	isMultiDiscussionRoom?: boolean;
}

export function ParticipantTurn({
	// participant,
	// turn
	isMultiDiscussionRoom,
}: ParticipantTurnProps) {
	// const timeSent = format(parseISO(""), "HH:mm")
	const theme = PARTICIPANT_COLORS[1];

	return (
		// so that mini timeline can grab this?
		<div className="group space-y-2 max-w-xl" id={"turn-id"}>
			<div className={cn("relative pl-4 border-l-2", theme.border)}>
				<div className="flex flex-col mb-2">
					<div className="flex items-center gap-2">
						<span className={cn("text-sm font-medium font-serif", theme.text)}>
							Gemma
						</span>
						{isMultiDiscussionRoom && (
							<Badge
								className="text-[10px] uppercase tracking-widest px-2 py-0 h-4 border-border/50 text-muted-foreground font-mono"
								variant="outline"
							>
								Respond
							</Badge>
						)}
					</div>
					<span className="text-xs text-muted-foreground">
						google/gemma-4.123
					</span>
				</div>
				<TurnPerspectiveExpander className="prose prose-sm max-w-none text-foreground/85 dark:prose-invert">
					<TurnPerspective content={LONG_MARKDOWN} />
				</TurnPerspectiveExpander>
			</div>
			<ParticipantTurnMenu content={""} time={"13:26"} />
		</div>
	);
}
