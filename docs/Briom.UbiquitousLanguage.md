# Ubiquitous Language

Ini bukan "variable naming convention". Ini adalah shared language yang semua code, test, docs, bahkan UI copy harus pakai.

| Term              | Definition                                                                     | Bukan                                  |
| ----------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| **Room**          | Dedicated thinking space. Container untuk deliberation.                        | Bukan "chat", "conversation", "thread" |
| **Participant**   | AI model yang di-invite ke room. Punya identity (display name + model).        | Bukan "bot", "agent", "user"           |
| **Moderator**     | Human user yang guide deliberation. Selalu satu per room (MVP).                | Bukan "admin", "owner"                 |
| **Turn**          | Single contribution dalam deliberation. Punya author, intent, content, status. | Bukan "message", "response", "reply"   |
| **Intent**        | Purpose dari turn. Mengapa participant ini speak sekarang?                     | Bukan "action", "command", "type"      |
| **Deliberation**  | The ongoing process of evolving perspectives through sequential turns.         | Bukan "chat history", "context"        |
| **Orchestration** | The act of moderator deciding who speaks next, with what intent.               | Bukan "automation", "routing"          |
| **Perspective**   | The unique reasoning contribution dari satu participant.                       | Bukan "answer", "output", "generation" |

Kenapa ini matter: Kalo kamu panggil "message" di domain layer, otak kamu (dan AI assistant lain) bakal default ke chat paradigm. Kalo kamu panggil "Turn" dengan "Intent", otak kamu stay di deliberation paradigm.
