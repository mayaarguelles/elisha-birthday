export function onRequest(context, next) {
  const { request, cookies, url } = context;
  
  // Only handle POST requests for password submission
  if (request.method === 'POST') {
    return handlePasswordSubmission(context);
  }
  
  // For GET requests, just continue
  return next();
}

async function handlePasswordSubmission(context) {
  const { request, cookies, redirect, url } = context;
  
  try {
    const formData = await request.formData();
    const password = formData.get('password');
    const pagePassword = formData.get('pagePassword');
    const redirectPath = formData.get('redirectPath') || url.pathname;
    
    // Check if the submitted password matches the page's password
    if (password === pagePassword) {
      // Set a cookie to remember authentication for this specific page
      const cookieName = `auth_${redirectPath.replace(/\//g, '_')}`;
      
      // Check if we're in development (HTTP) or production (HTTPS)
      const isProduction = url.protocol === 'https:';
      
      cookies.set(cookieName, password, {
        path: redirectPath,
        httpOnly: true,
        secure: isProduction, // Only require HTTPS in production
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      });
      
      return redirect(redirectPath);
    }
    
    // If password is incorrect, redirect back with error flag
    return redirect(`${redirectPath}?error=1`);
  } catch (error) {
    console.error('Password submission error:', error);
    return redirect(url.pathname);
  }
}