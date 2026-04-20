import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const MARKETING_DIR = path.join(__dirname, 'Mise a jour des infos marketing AGTM')
const BUCKET_NAME = 'agtm-marketing'
const FOLDER = '2026'

async function createBucketIfNotExists() {
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) {
    console.error('Error listing buckets:', error.message)
    return
  }
  const bucketExists = buckets.some(b => b.name === BUCKET_NAME)
  if (!bucketExists) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 1024 * 1024 * 10 // 10MB
    })
    if (createError) {
      console.error('Error creating bucket:', createError.message)
    } else {
      console.log(`Bucket "${BUCKET_NAME}" created.`)
    }
  } else {
    console.log(`Bucket "${BUCKET_NAME}" already exists.`)
  }
}

async function uploadFile(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath)
  const storagePath = `${FOLDER}/${fileName}`
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: getMimeType(fileName),
      upsert: true
    })
  if (error) {
    console.error(`Error uploading ${fileName}:`, error.message)
    return null
  } else {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath)
    console.log(`Uploaded ${fileName}: ${data.publicUrl}`)
    return data.publicUrl
  }
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.pdf') return 'application/pdf'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.html') return 'text/html'
  return 'application/octet-stream'
}

async function main() {
  await createBucketIfNotExists()
  
  const filesToUpload = [
    // PDFs
    { src: 'agtm-brochure-marketing-2026.pdf', dest: 'agtm-brochure-marketing-2026.pdf' },
    { src: 'agtm-visuels-programmes-2026.pdf', dest: 'agtm-visuels-programmes-2026.pdf' },
    { src: 'lingua-space-marketing-2026.pdf', dest: 'lingua-space-marketing-2026.pdf' },
    // Hero images
    { src: 'agtm-brochure-marketing-2026-hero.jpg', dest: 'agtm-brochure-marketing-2026-hero.jpg' },
    { src: 'agtm-visuels-programmes-2026-hero.jpg', dest: 'agtm-visuels-programmes-2026-hero.jpg' },
    { src: 'lingua-space-marketing-2026-hero.jpg', dest: 'lingua-space-marketing-2026-hero.jpg' },
    // Social AGTM
    { src: 'social-agtm-instagram-1080x1080.jpg', dest: 'social-agtm-instagram-1080x1080.jpg' },
    { src: 'social-agtm-linkedin-1200x627.jpg', dest: 'social-agtm-linkedin-1200x627.jpg' },
    { src: 'social-agtm-story-1080x1920.jpg', dest: 'social-agtm-story-1080x1920.jpg' },
    // Social Lingua
    { src: 'social-lingua-instagram-1080x1080.jpg', dest: 'social-lingua-instagram-1080x1080.jpg' },
    { src: 'social-lingua-linkedin-1200x627.jpg', dest: 'social-lingua-linkedin-1200x627.jpg' },
    { src: 'social-lingua-story-1080x1920.jpg', dest: 'social-lingua-story-1080x1920.jpg' },
  ]

  const results = {}
  for (const file of filesToUpload) {
    const srcPath = path.join(MARKETING_DIR, file.src)
    if (!fs.existsSync(srcPath)) {
      console.warn(`File not found: ${file.src}`)
      continue
    }
    const url = await uploadFile(srcPath, file.dest)
    if (url) results[file.dest] = url
  }

  // Save URLs to a JSON file for later use
  const outputPath = path.join(__dirname, 'src', 'lib', 'marketingUrls.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`URLs saved to ${outputPath}`)
}

main().catch(console.error)