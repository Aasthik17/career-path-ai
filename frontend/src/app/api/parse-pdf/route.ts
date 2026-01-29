import { NextResponse } from 'next/server';
import { extractText } from 'unpdf';

/**
 * PDF Parser API
 * Extracts text from PDF files using unpdf (server-side compatible)
 */

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        console.log('Parsing PDF:', file.name, 'Size:', file.size);

        // Read file as buffer
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Extract text using unpdf (server-side compatible)
        const { text, totalPages } = await extractText(uint8Array, { mergePages: true });

        console.log('PDF text extracted, length:', text.length);
        console.log('Total pages:', totalPages);
        console.log('Preview:', text.substring(0, 300));

        return NextResponse.json({
            text: text,
            numPages: totalPages,
        });
    } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json(
            {
                error: 'Failed to parse PDF',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
