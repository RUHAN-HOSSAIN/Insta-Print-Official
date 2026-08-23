
const HowToPrint = () => {
  return (
    <div className="font-spaceG w-full flex flex-col items-center justify-center gap-4 px-30 pt-20 pb-30 dark:bg-gray-900">
      <div className="my-20">
        <h1 className="text-5xl font-bold ">How to Print?</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 text-lg text-gray-800 dark:text-gray-300">
        <div className="shadow-xl border-2 border-blue rounded-xl p-5 h-80">
          <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-3">1. Upload your pdf/image</h2>

        </div>
        <div className="shadow-xl border-2 border-blue rounded-xl p-5 h-80">
          <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-3">2. Customised Printing</h2>
        </div>
        <div className="shadow-xl border-2 border-blue rounded-xl p-5 h-80">
          <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-3">3. select "Cover Page" for collect later</h2>
        </div>
        <div className="shadow-xl border-2 border-blue rounded-xl p-5 h-80">
          <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-3">4. Check Total Cost and make Payment</h2>
        </div>
        <div className="shadow-xl border-2 border-blue rounded-xl p-5 h-80">
          <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-3">5. Final Review and checkout</h2>
        </div>
        <div className="shadow-xl border-2 border-blue rounded-xl p-5 h-80">
          <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-3">6. Press 'Print Now' Button</h2>
        </div>
      </div>
    </div>
  )
}

export default HowToPrint