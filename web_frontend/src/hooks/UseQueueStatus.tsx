import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

const UseQueueStatus = () => {
  return useQuery({
    queryKey: ["queueStatus"],
    queryFn: async () => {
      const res = await axiosInstance.get("/queue/status");
      return res.data; // e.g. { pending: 3, current: "job_101" }
    },
    refetchInterval: 5000, // প্রতি ৫ সেকেন্ডে auto-refresh
  });
};

export default UseQueueStatus;