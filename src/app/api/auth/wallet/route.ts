import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, WEB3_AUTH_SIGN_MESSAGE } from '@/lib/signatureVerification';
import { AuthService } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, signature, wallet } = body;

    if (!address || !signature || !wallet) {
      return NextResponse.json(
        { error: 'Missing required fields: address, signature, wallet' },
        { status: 400 }
      );
    }

    console.log('Verifying signature:', {
      message: WEB3_AUTH_SIGN_MESSAGE,
      signature,
      address
    });

    // Verify the signature using the correct message
    const verificationResult = await verifySignature(
      WEB3_AUTH_SIGN_MESSAGE,
      signature,
      address
    );

    console.log('Signature verification result:', verificationResult);

    if (!verificationResult.isValid) {
      console.log('Signature verification failed: Signature verification failed');
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    // Create or get user
    const user = await AuthService.createOrGetUser(address, wallet);

    // Generate JWT token
    const token = await AuthService.generateToken(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        address: user.address,
        wallet: user.wallet,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authData = AuthService.getAuthData();
    
    if (!authData) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    // Validate session in database
    const user = await AuthService.validateSession(authData.address);
    
    if (!user) {
      // Clear invalid auth data
      AuthService.clearAuthData();
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        address: user.address,
        wallet: user.wallet,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication check failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authData = AuthService.getAuthData();
    
    if (authData?.address) {
      // Logout user from database
      await AuthService.logoutUser(authData.address);
    }
    
    // Logout user from local storage
    AuthService.logout();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
} 