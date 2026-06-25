export type DeliveryStatus = "S" | "D" | "R"

export type ChatMessage = {
  id: string
  direction: "incoming" | "outgoing"
  text: string
  time: string
}

export type ChatThread = {
  id: string
  displayName: string
  username: string
  avatarColor: string
  avatarUrl?: string
  lastPreview: string
  timestamp: string
  status?: DeliveryStatus
  messages: ChatMessage[]
}

export type KikProfile = {
  displayName: string
  username: string
  avatarColor: string
  avatarUrl?: string
}

export const kikProfile: KikProfile = {
  displayName: "Lauren Roberson",
  username: "laurenroberson",
  avatarColor: "#5856D6",
}

export const chatThreads: ChatThread[] = [
  {
    id: "alex-rivera",
    displayName: "Alex Rivera",
    username: "alexrivera",
    avatarColor: "#FF9500",
    lastPreview: "See you at the park!",
    timestamp: "10 min",
    status: "D",
    messages: [
      { id: "ar-1", direction: "incoming", text: "hey are you free later?", time: "2:14 PM" },
      { id: "ar-2", direction: "outgoing", text: "yeah whats up", time: "2:15 PM" },
      { id: "ar-3", direction: "incoming", text: "wanna meet at the park around 5?", time: "2:16 PM" },
      { id: "ar-4", direction: "outgoing", text: "sounds good", time: "2:17 PM" },
      { id: "ar-5", direction: "incoming", text: "cool ill bring snacks", time: "2:18 PM" },
      { id: "ar-6", direction: "outgoing", text: "See you at the park!", time: "2:19 PM" },
    ],
  },
  {
    id: "sarah-jenkins",
    displayName: "Sarah Jenkins",
    username: "sarahjenkins",
    avatarColor: "#FF2D55",
    lastPreview: "That's hilarious 😂",
    timestamp: "2 hrs",
    status: "R",
    messages: [
      { id: "sj-1", direction: "outgoing", text: "did you see what tyler posted", time: "11:02 AM" },
      { id: "sj-2", direction: "incoming", text: "no what happened", time: "11:05 AM" },
      { id: "sj-3", direction: "outgoing", text: "he tried to skateboard down the stairs at school", time: "11:06 AM" },
      { id: "sj-4", direction: "incoming", text: "omg no way", time: "11:08 AM" },
      { id: "sj-5", direction: "outgoing", text: "he landed in a bush lol", time: "11:09 AM" },
      { id: "sj-6", direction: "incoming", text: "That's hilarious 😂", time: "11:10 AM" },
    ],
  },
]

export function getThreadById(id: string): ChatThread | undefined {
  return chatThreads.find((thread) => thread.id === id)
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
