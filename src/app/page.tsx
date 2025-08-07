'use client';

export default function Home() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'>
      {/* Hero Section */}
      <section className='relative px-6 py-24 sm:px-6 sm:py-32 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h1 className='text-4xl font-bold tracking-tight text-white sm:text-6xl'>
            🎮 Game Arena
          </h1>
          <p className='mt-6 text-lg leading-8 text-gray-300'>
            The ultimate gaming platform where strategy meets competition. Challenge players
            worldwide in classic games like Chess, Checkers, Solitaire, and Belot.
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <a
              href='#games'
              className='rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            >
              Start Playing
            </a>
            <a href='#about' className='text-sm font-semibold leading-6 text-white'>
              Learn more <span aria-hidden='true'>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='games' className='py-24 sm:py-32'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl lg:text-center'>
            <h2 className='text-base font-semibold leading-7 text-indigo-400'>Available Games</h2>
            <p className='mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl'>
              Classic Games, Modern Experience
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-300'>
              Choose from our collection of timeless games, each with modern features and
              competitive gameplay.
            </p>
          </div>
          <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none'>
            <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4'>
              <div className='flex flex-col'>
                <dt className='flex items-center gap-x-3 text-base font-semibold leading-7 text-white'>
                  ♟️ Chess
                </dt>
                <dd className='mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300'>
                  <p className='flex-auto'>
                    The ultimate game of strategy. Challenge players worldwide in classic chess
                    matches.
                  </p>
                  <p className='mt-6'>
                    <a href='#' className='text-sm font-semibold leading-6 text-indigo-400'>
                      Play Chess <span aria-hidden='true'>→</span>
                    </a>
                  </p>
                </dd>
              </div>
              <div className='flex flex-col'>
                <dt className='flex items-center gap-x-3 text-base font-semibold leading-7 text-white'>
                  🔴 Checkers
                </dt>
                <dd className='mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300'>
                  <p className='flex-auto'>
                    Classic checkers with modern twists. Jump, capture, and crown your way to
                    victory.
                  </p>
                  <p className='mt-6'>
                    <a href='#' className='text-sm font-semibold leading-6 text-indigo-400'>
                      Play Checkers <span aria-hidden='true'>→</span>
                    </a>
                  </p>
                </dd>
              </div>
              <div className='flex flex-col'>
                <dt className='flex items-center gap-x-3 text-base font-semibold leading-7 text-white'>
                  🃏 Solitaire
                </dt>
                <dd className='mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300'>
                  <p className='flex-auto'>
                    Relax and unwind with classic solitaire. Multiple variants available.
                  </p>
                  <p className='mt-6'>
                    <a href='#' className='text-sm font-semibold leading-6 text-indigo-400'>
                      Play Solitaire <span aria-hidden='true'>→</span>
                    </a>
                  </p>
                </dd>
              </div>
              <div className='flex flex-col'>
                <dt className='flex items-center gap-x-3 text-base font-semibold leading-7 text-white'>
                  🃏 Belot
                </dt>
                <dd className='mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300'>
                  <p className='flex-auto'>
                    The classic Bulgarian card game. Team up and compete for the highest score.
                  </p>
                  <p className='mt-6'>
                    <a href='#' className='text-sm font-semibold leading-6 text-indigo-400'>
                      Play Belot <span aria-hidden='true'>→</span>
                    </a>
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='relative isolate mt-32 px-6 py-32 sm:mt-40 sm:py-40 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
            Ready to start your gaming journey?
          </h2>
          <p className='mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300'>
            Join thousands of players worldwide. Create an account and start competing today.
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <a
              href='#'
              className='rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            >
              Get Started
            </a>
            <a href='#' className='text-sm font-semibold leading-6 text-white'>
              Learn more <span aria-hidden='true'>→</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
