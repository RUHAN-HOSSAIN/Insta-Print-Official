
const PrinterStatus = () => {
  return (
    <div className="p-5 border border-gray-300 rounded-lg shadow-md flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-spaceG text-lg font-bold">
          Select Collection Point
        </h2>
        {/* <div className="animate-pulse bg-green-600 text-white px-2.5 py-0.5 rounded-xl font-medium text-sm">
          Online
        </div> */}
        <div className="animate-pulse bg-red-600 text-white px-2.5 py-0.5 rounded-xl font-medium text-sm">
          Offline
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <select className="bg-gray-100 border border-gray-300 py-2 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="none">Select Hall</option>
          <option value="male_hall_02">Male Hall 2</option>
          <option value="none" disabled>Upcoming ...</option>
        </select>
      </div>
      <div className="flex items-center justify-between gap-3 pt-5 px-2">
        <h2 className="text-gray-700 font-spaceG">
          <b>Queue:</b> 5 job ahead you
        </h2>
        
      </div>
    </div>
  )
}

export default PrinterStatus