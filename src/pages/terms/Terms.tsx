
const Terms = () => {
  return (
    <>
      <header className="bg-inherit">
        <h1 className="px-app title">Terms</h1>
      </header>

      <main className='px-app py-4 flex flex-row flex-nowrap flex-1 h-full gap-3 overflow-x-auto'>
        <div className='bg-surface rounded-3xl h-full w-[20rem] sm:w-[20rem] md:w-[22rem] lg:w-[22rem] xl:w-[32rem] flex-none'></div>
        <div className='bg-surface rounded-3xl h-full w-[20rem] sm:w-[20rem] md:w-[22rem] lg:w-[26rem] xl:w-[32rem] flex-none'></div>
        <div className='bg-surface rounded-3xl h-full w-[20rem] sm:w-[20rem] md:w-[22rem] lg:w-[26rem] xl:w-[32rem] flex-none'></div>
        <div className='bg-surface rounded-3xl h-full w-[20rem] sm:w-[20rem] md:w-[22rem] lg:w-[26rem] xl:w-[32rem] flex-none'></div>
      </main>
    </>
  )
}

export default Terms
export { Terms }