export const demoCourseContext = `
课程：CIE6016 Advanced Computer Network

资料 1：Lecture 3 - TCP Basics
TCP 是一种可靠的传输层协议，提供有序交付、重传、流量控制和拥塞控制。
TCP 使用确认应答来确认已收到的数据。

资料 2：Lecture 4 - TCP Congestion Control
TCP 拥塞控制根据网络拥塞状况调整发送速率。重要机制包括慢启动、拥塞避免、
快速重传和快速恢复。拥塞窗口（cwnd）限制发送方在网络中尚未被确认的数据量。
在慢启动期间，TCP 指数增长 cwnd，直到达到阈值。
在拥塞避免期间，TCP 更缓慢地增长 cwnd。
检测到丢包时，TCP 会减小 cwnd，以避免网络拥塞进一步恶化。

资料 3：Student Notes - Transport Layer
TCP 流量控制主要与接收窗口有关，拥塞控制则与网络状况有关。
发送方决定发送多少数据时，必须同时考虑接收窗口和拥塞窗口。
`;

export const demoSources = [
  "Lecture 3 - TCP Basics",
  "Lecture 4 - TCP Congestion Control",
  "Student Notes - Transport Layer",
];
