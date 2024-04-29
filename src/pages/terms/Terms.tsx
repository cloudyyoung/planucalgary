
const Terms = () => {
  return (
    <>
      <div className='flex flex-col h-screen w-screen'>


        <header className="bg-surface">
          <div className="mx-auto px-4 md:px-6 py-4">
            <h1 className="text-3xl font-medium text-primary-30 font-serif">Terms</h1>
          </div>
        </header>

        <main className='px-4 md:px-6 py-4 flex flex-row flex-nowrap flex-1 h-full gap-3 overflow-x-auto'>
          <div className='bg-white rounded-3xl h-full w-[20rem] sm:w-[20rem] md:w-[22rem] lg:w-[22rem] xl:w-[32rem] flex-none'></div>
          <div className='bg-white rounded-3xl h-full w-[20rem] sm:w-[20rem] md:w-[22rem] lg:w-[26rem] xl:w-[32rem] flex-none'></div>
          <div className='bg-white rounded-3xl h-full w-[20rem] sm:w-[20rem] md:w-[22rem] lg:w-[26rem] xl:w-[32rem] flex-none'></div>
          <div className='bg-white rounded-3xl h-full w-[20rem] sm:w-[20rem] md:w-[22rem] lg:w-[26rem] xl:w-[32rem] flex-none'></div>
        </main>
      </div>
    </>
  )
}

export default Terms
export { Terms }