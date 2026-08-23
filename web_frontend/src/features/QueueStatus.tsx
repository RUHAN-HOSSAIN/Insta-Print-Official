
import UseQueueStatus from "../hooks/UseQueueStatus";

const QueueStatus = () => {
  const { data, isLoading } = UseQueueStatus();

  if (isLoading) return <p>Loading queue...</p>;

  return (
    <div className="p-3 rounded-lg bg-gray-100 text-sm">
      Current queue: <span className="font-semibold">{data?.pending ?? 0}</span> jobs waiting
    </div>
  );
};

export default QueueStatus;