'use client';

import IconDemo from '@/components/IconDemo';
import LoaderDemo from '@/components/ui/LoaderDemo';
import Image from 'next/image';
import {useTranslations} from 'next-intl';

export default function Home() {
  const t = useTranslations('homePage');
  
  return (
    <main className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900'>
      {/* Hero Section */}
      <section className='relative px-6 py-24 sm:px-6 sm:py-32 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl flex items-center justify-center gap-[40px]'>
            <Image
              src="/images/logoGarena-transp.png"
              alt="Game Arena Logo"
              width={100}
              height={100}
              className="h-auto w-auto"
              priority
            />
             <span>{t('hero.title')}</span>
          </h1>
          <p className='mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300'>
            {t('hero.subtitle')}. {t('hero.description')}
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <a
              href='#games'
              className='rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-white'
            >
              {t('hero.startPlaying')}
            </a>
            <a href='#about' className='text-sm font-semibold leading-6 text-blue-600 dark:text-white hover:text-blue-700 dark:hover:text-gray-300'>
              {t('hero.learnMore')} <span aria-hidden='true'>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='games' className='py-24 sm:py-32'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl lg:text-center'>
            <h2 className='text-base font-semibold leading-7 text-blue-600 dark:text-indigo-400'>{t('games.title')}</h2>
            <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl'>
              {t('games.subtitle')}
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300'>
              {t('games.description')}
            </p>
          </div>
          <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none'>
            <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4'>
              <div className='flex flex-col'>
                <dt className='flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white'>
                  {t('games.chess.title')}
                </dt>
                <dd className='mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300'>
                  <p className='flex-auto'>
                    {t('games.chess.description')}
                  </p>
                  <p className='mt-6'>
                    <a href='#' className='text-sm font-semibold leading-6 text-blue-600 dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300'>
                      {t('games.chess.playButton')} <span aria-hidden='true'>→</span>
                    </a>
                  </p>
                </dd>
              </div>
              <div className='flex flex-col'>
                <dt className='flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white'>
                  {t('games.checkers.title')}
                </dt>
                <dd className='mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300'>
                  <p className='flex-auto'>
                    {t('games.checkers.description')}
                  </p>
                  <p className='mt-6'>
                    <a href='#' className='text-sm font-semibold leading-6 text-blue-600 dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300'>
                      {t('games.checkers.playButton')} <span aria-hidden='true'>→</span>
                    </a>
                  </p>
                </dd>
              </div>
              <div className='flex flex-col'>
                <dt className='flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white'>
                  {t('games.solitaire.title')}
                </dt>
                <dd className='mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300'>
                  <p className='flex-auto'>
                    {t('games.solitaire.description')}
                  </p>
                  <p className='mt-6'>
                    <a href='#' className='text-sm font-semibold leading-6 text-blue-600 dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300'>
                      {t('games.solitaire.playButton')} <span aria-hidden='true'>→</span>
                    </a>
                  </p>
                </dd>
              </div>
              <div className='flex flex-col'>
                <dt className='flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white'>
                  {t('games.belot.title')}
                </dt>
                <dd className='mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300'>
                  <p className='flex-auto'>
                    {t('games.belot.description')}
                  </p>
                  <p className='mt-6'>
                    <a href='#' className='text-sm font-semibold leading-6 text-blue-600 dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300'>
                      {t('games.belot.playButton')} <span aria-hidden='true'>→</span>
                    </a>
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Icon Demo Section */}
      <section className='py-24 sm:py-32 bg-white dark:bg-gray-900'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl lg:text-center mb-12'>
            <h2 className='text-base font-semibold leading-7 text-blue-600 dark:text-indigo-400'>{t('sections.iconSystem.title')}</h2>
            <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl'>
              {t('sections.iconSystem.subtitle')}
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300'>
              {t('sections.iconSystem.description')}
            </p>
          </div>
          <IconDemo />
        </div>
      </section>

      {/* Loader Demo Section */}
      <section className='py-24 sm:py-32 bg-gray-50 dark:bg-gray-800'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl lg:text-center mb-12'>
            <h2 className='text-base font-semibold leading-7 text-blue-600 dark:text-indigo-400'>{t('sections.loadingSystem.title')}</h2>
            <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl'>
              {t('sections.loadingSystem.subtitle')}
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300'>
              {t('sections.loadingSystem.description')}
            </p>
          </div>
          <LoaderDemo />
        </div>
      </section>

      {/* CTA Section */}
      <section className='relative isolate mt-32 px-6 py-32 sm:mt-40 sm:py-40 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl'>
            {t('sections.gamingJourney.title')}
          </h2>
          <p className='mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300'>
            {t('sections.gamingJourney.subtitle')}
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <a
              href='#'
              className='rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-white'
            >
              {t('sections.gamingJourney.getStarted')}
            </a>
            <a href='#' className='text-sm font-semibold leading-6 text-blue-600 dark:text-white hover:text-blue-700 dark:hover:text-gray-300'>
              {t('sections.gamingJourney.learnMore')} <span aria-hidden='true'>→</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
