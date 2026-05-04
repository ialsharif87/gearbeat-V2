import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Contract generate request:', body)
    
    const {
      type = 'seller',
      sellerNameAr = '',
      sellerNameEn = '',
      companyNameAr = '',
      companyNameEn = '',
      email = '',
      phone = '',
      city = '',
      commissionPercent = 15,
      contractDate = new Date().toLocaleDateString('ar-SA'),
    } = body

    let html = ''
    
    if (type === 'studio') {
      const { generateStudioContract } = await import('@/lib/contracts/studio-template')
      html = generateStudioContract({
        sellerNameAr,
        sellerNameEn,
        companyNameAr,
        companyNameEn,
        email,
        phone,
        city,
        commissionPercent: Number(commissionPercent),
        contractDate,
      })
    } else {
      const { generateSellerContract } = await import('@/lib/contracts/seller-template')
      html = generateSellerContract({
        sellerNameAr,
        sellerNameEn,
        companyNameAr,
        companyNameEn,
        email,
        phone,
        city,
        commissionPercent: Number(commissionPercent),
        contractDate,
      })
    }

    console.log('Contract generated successfully, length:', html.length)

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Contract generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate contract', details: String(error) },
      { status: 500 }
    )
  }
}
