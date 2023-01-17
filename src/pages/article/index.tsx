import Link from 'next/link'
import Image from 'next/image'
import dayjs from 'dayjs'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import cN from 'clsx'

import {api} from 'utils/api'

import NavbarLayout from 'layouts/navbar'
import MetaHead from 'components/meta-head'
import DivAnimate from 'components/div-animate'
import {QueryWrapper} from 'components/query-placeholder'
import TextAreaInput from 'components/form-textarea'
import {Button} from 'components/button'
import {PencilIcon} from '@heroicons/react/24/solid'

import {slugify} from 'utils/literal'
import {articleCreateSchema} from 'schema/article'

import {type SubmitHandler} from 'react-hook-form'
import {type ArticleCreateType, type ArticleType} from 'schema/article'

export default function ArticlePage() {
	const articlesQuery = api.article.fetchAll.useQuery()

	return (
		<>
			<MetaHead
				title='Articles (example) | Create T3 App'
				description='Example on how to build full stack app using extended T3 stack'
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				imageUrl={`https://${process.env.NEXT_PUBLIC_VERCEL_URL}/images/articles.jpg`}
			/>
			<main className='container mx-auto max-w-screen-lg space-y-8 px-8'>
				<h1 className='text-3xl text-gray-50'>Articles</h1>
				<QueryWrapper
					label='articles'
					className='h-64 md:h-96'
					{...articlesQuery}
				>
					{(articles) => (
						<DivAnimate className='grid grid-cols-6 gap-4'>
							{articles.map((article) => (
								<Card key={article.id} {...article} />
							))}
						</DivAnimate>
					)}
				</QueryWrapper>
				<CreateArticleForm refetchList={articlesQuery.refetch} />
			</main>
		</>
	)
}

const Card = ({id, title, content, createdAt, author}: ArticleType) => {
	return (
		<Link
			href={`./article/${slugify(title, id)}`}
			className={cN(
				'relative col-span-full flex h-64 flex-col overflow-hidden p-6 pb-4',
				'rounded rounded-br-3xl rounded-tl-2xl border border-light-head/25 bg-opacity-20 bg-gradient-to-br from-light-bg/30 to-light-bg/10',
				'md:col-span-3 lg:col-span-2',
				'hover:bg-opacity-30 hover:shadow-lg hover:shadow-light-bg/25 '
			)}
		>
			<div className='absolute top-0 left-0'>
				<div className='flex rounded-br-xl bg-dark-bg/30 shadow'>
					<div className='flex w-16 items-center justify-center'>
						{/* <StarIcon className='text-sm text-yellow-300' /> */}
					</div>
					<div className='py-0.5 px-4'>
						<time className='font-body text-sm italic'>
							{dayjs(createdAt).format('MMM D, YYYY')}
						</time>
					</div>
				</div>
				{author.image && (
					<div className='h-14 w-16 rounded-br-xl bg-dark-bg/30 shadow-xl'>
						<Image
							className='h-full w-full rounded-tl-lg rounded-br-xl object-cover'
							src={author.image}
							alt='author picture'
							width={72}
							height={72}
						/>
					</div>
				)}
			</div>
			<div className='mt-1 h-fit w-full text-xl text-light-head'>
				{author.image && <div className='float-left mr-2 h-12 w-12' />}
				<h2 className='mt-1 max-h-[5rem] overflow-clip'>{title}</h2>
				<div className='mt-0.5 flex h-1 items-center gap-2'>
					<div className='h-[1px] w-auto grow rounded-full bg-secondary-normal/50' />
					<Triangle />
				</div>
			</div>

			<p className='overflow-hidden pt-4 text-right indent-12 leading-5 line-clamp-6'>
				{content}
			</p>
		</Link>
	)
}

const CreateArticleForm = ({
	refetchList,
}: {
	refetchList: () => Promise<unknown>
}) => {
	const {
		register,
		formState: {errors},
		reset,
		handleSubmit,
	} = useForm<ArticleCreateType>({
		mode: 'onTouched',
		resolver: zodResolver(articleCreateSchema),
	})

	const formProps = {register, errors}

	const {mutate, isLoading} = api.article.create.useMutation({
		onError: (error) => {
			let message = error.message
			if (error.data?.code === 'UNAUTHORIZED') {
				message = 'You have to logged in to create article.'
			}
			alert(message)
		},
		onSuccess: () => {
			void refetchList()
			reset()
		},
	})

	const onValidSubmit: SubmitHandler<ArticleCreateType> = (data) => {
		mutate(data)
	}

	return (
		<div className='space-y-2'>
			<div className='flex items-center justify-center gap-4 text-light-head'>
				<div className='h-px w-auto grow rounded-full bg-secondary-normal/50' />
				<Triangle />
				<p className='w-fit text-lg'>Create New Article</p>
				<Triangle className='rotate-180' />
				<div className='h-[1px] w-auto grow rounded-full bg-secondary-normal/50' />
			</div>
			<div className='mx-auto lg:w-3/4'>
				<form
					onSubmit={(...args) => void handleSubmit(onValidSubmit)(...args)}
					className='flex flex-col gap-4'
				>
					<TextAreaInput name='title' {...formProps} />
					<TextAreaInput name='content' rows={5} {...formProps} />
					<Button type='submit' variant='outlined' isLoading={isLoading}>
						Create <PencilIcon className='h-4 w-4' />
					</Button>
				</form>
			</div>
		</div>
	)
}

const Triangle = ({className}: {className?: string}) => {
	return <span className={cN('text-secondary-lighter', className)}>⨞</span>
}

ArticlePage.getLayout = function getLayout(page: React.ReactElement) {
	return <NavbarLayout>{page}</NavbarLayout>
}
