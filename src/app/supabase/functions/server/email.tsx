// Email notification utilities using Resend
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = 'smith68d@gmail.com'; // Admin email for notifications

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    throw new Error('Email service not configured - RESEND_API_KEY missing');
  }

  try {
    console.log(`Attempting to send email to: ${to}, subject: ${subject}`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'RetirePath <onboarding@resend.dev>', // Using Resend's testing domain
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', JSON.stringify(data, null, 2));
      throw new Error(`Resend API error: ${data.message || 'Failed to send email'}`);
    }

    console.log('Email sent successfully! Email ID:', data.id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Email Templates

export function agentLeadNotificationEmail(lead: any) {
  return {
    to: ADMIN_EMAIL,
    subject: `New Agent Referral Lead - ${lead.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #1f2937; }
            .value { color: #4b5563; margin-left: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .highlight { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏡 New Agent Referral Lead</h1>
            </div>
            <div class="content">
              <div class="highlight">
                <strong>Lead Source:</strong> ${lead.lead_source || 'home_valuation'}
              </div>

              <div class="section">
                <h2>Contact Information</h2>
                <p><span class="label">Name:</span><span class="value">${lead.name}</span></p>
                <p><span class="label">Email:</span><span class="value">${lead.email}</span></p>
                <p><span class="label">Phone:</span><span class="value">${lead.phone || 'Not provided'}</span></p>
              </div>

              <div class="section">
                <h2>Property Details</h2>
                <p><span class="label">Location:</span><span class="value">${lead.suburb || ''} ${lead.state || ''} ${lead.postcode}</span></p>
                <p><span class="label">Property Type:</span><span class="value">${lead.home_type || 'Not specified'}</span></p>
                <p><span class="label">Estimated Value:</span><span class="value">$${lead.estimated_value?.toLocaleString() || 'Not provided'}</span></p>
                <p><span class="label">Bedrooms:</span><span class="value">${lead.bedrooms || 'Not specified'}</span></p>
                <p><span class="label">Bathrooms:</span><span class="value">${lead.bathrooms || 'Not specified'}</span></p>
              </div>

              <div class="section">
                <h2>Timeline</h2>
                <p><span class="label">When to sell:</span><span class="value">${lead.timeline || 'Not specified'}</span></p>
              </div>

              ${lead.additional_notes ? `
              <div class="section">
                <h2>Additional Notes</h2>
                <p style="background-color: white; padding: 15px; border-radius: 4px;">${lead.additional_notes}</p>
              </div>
              ` : ''}

              <div class="footer">
                <p>This lead was submitted via RetirePath on ${new Date().toLocaleString()}</p>
                <p>Login to your admin dashboard to manage this lead</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function villageSubmissionNotificationEmail(village: any) {
  return {
    to: ADMIN_EMAIL,
    subject: `New Village Submission - ${village.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #1f2937; }
            .value { color: #4b5563; margin-left: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .highlight { background-color: #dbeafe; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏘️ New Village Submission</h1>
            </div>
            <div class="content">
              <div class="highlight">
                <strong>Status:</strong> Pending Approval
              </div>

              <div class="section">
                <h2>Village Information</h2>
                <p><span class="label">Name:</span><span class="value">${village.name}</span></p>
                <p><span class="label">Location:</span><span class="value">${village.suburb}, ${village.state} ${village.postcode}</span></p>
                <p><span class="label">Village Type:</span><span class="value">${village.village_type || 'Not specified'}</span></p>
                ${village.care_level ? `<p><span class="label">Care Level:</span><span class="value">${village.care_level}</span></p>` : ''}
              </div>

              <div class="section">
                <h2>Operator Contact</h2>
                <p><span class="label">Email:</span><span class="value">${village.contact_email}</span></p>
                <p><span class="label">Phone:</span><span class="value">${village.contact_phone || 'Not provided'}</span></p>
                ${village.operator ? `<p><span class="label">Operator:</span><span class="value">${village.operator}</span></p>` : ''}
              </div>

              ${village.description ? `
              <div class="section">
                <h2>Description</h2>
                <p style="background-color: white; padding: 15px; border-radius: 4px;">${village.description}</p>
              </div>
              ` : ''}

              <div style="text-align: center; margin-top: 30px;">
                <p>Review this submission in your admin dashboard:</p>
              </div>

              <div class="footer">
                <p>Submitted on ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function villageApprovedEmail(village: any, operatorEmail: string) {
  return {
    to: operatorEmail,
    subject: `Your Village Listing Has Been Approved! - ${village.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 20px; }
            .success-box { background-color: #d1fae5; padding: 20px; border-left: 4px solid #059669; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Congratulations!</h1>
            </div>
            <div class="content">
              <div class="success-box">
                <h2 style="margin-top: 0; color: #059669;">Your village listing has been approved!</h2>
                <p><strong>${village.name}</strong> is now live on RetirePath.</p>
              </div>

              <div class="section">
                <h2>What's Next?</h2>
                <ul>
                  <li>Your village is now visible in our public directory</li>
                  <li>Prospective residents can find and contact you</li>
                  <li>You can manage your listing anytime through the operator dashboard</li>
                </ul>
              </div>

              <div class="section">
                <h2>Boost Your Visibility</h2>
                <p>Consider upgrading to a <strong>Featured Listing</strong> to appear at the top of search results and get more inquiries!</p>
                <p>Featured listings get 3x more views on average.</p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${Deno.env.get('SUPABASE_URL') || 'https://retirepath.com.au'}" class="button">View Your Listing</a>
              </div>

              <div class="footer">
                <p>Thank you for partnering with RetirePath!</p>
                <p>If you have any questions, reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function villageRejectedEmail(village: any, operatorEmail: string, reason: string) {
  return {
    to: operatorEmail,
    subject: `Update on Your Village Submission - ${village.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 20px; }
            .warning-box { background-color: #fee2e2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Village Submission Update</h1>
            </div>
            <div class="content">
              <div class="warning-box">
                <h2 style="margin-top: 0; color: #dc2626;">Submission Not Approved</h2>
                <p>Unfortunately, we were unable to approve your submission for <strong>${village.name}</strong> at this time.</p>
              </div>

              <div class="section">
                <h2>Reason</h2>
                <p style="background-color: white; padding: 15px; border-radius: 4px;">${reason}</p>
              </div>

              <div class="section">
                <h2>Next Steps</h2>
                <p>You're welcome to resubmit your village listing after addressing the issues mentioned above.</p>
                <p>If you have any questions or need clarification, please don't hesitate to contact us.</p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${Deno.env.get('SUPABASE_URL') || 'https://retirepath.com.au'}" class="button">Submit Again</a>
              </div>

              <div class="footer">
                <p>Thank you for your interest in RetirePath.</p>
                <p>Reply to this email if you have any questions.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function featuredListingPurchaseEmail(village: any, operatorEmail: string, paymentDetails: any) {
  const emails = [];
  
  // Email to operator
  emails.push({
    to: operatorEmail,
    subject: `Featured Listing Activated - ${village.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 20px; }
            .success-box { background-color: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⭐ Featured Listing Activated!</h1>
            </div>
            <div class="content">
              <div class="success-box">
                <h2 style="margin-top: 0; color: #f59e0b;">Your village is now featured!</h2>
                <p><strong>${village.name}</strong> will appear at the top of search results for ${paymentDetails.duration} days.</p>
              </div>

              <div class="section">
                <h2>Payment Confirmation</h2>
                <p><strong>Amount:</strong> $${paymentDetails.amount}</p>
                <p><strong>Duration:</strong> ${paymentDetails.duration} days</p>
                <p><strong>Expires:</strong> ${new Date(Date.now() + paymentDetails.duration * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>

              <div class="section">
                <h2>What You Get</h2>
                <ul>
                  <li>⭐ Featured badge on your listing</li>
                  <li>🔝 Top position in search results</li>
                  <li>📈 3x more visibility</li>
                  <li>💼 Priority placement in relevant searches</li>
                </ul>
              </div>

              <div class="footer">
                <p>Thank you for your purchase!</p>
                <p>We'll notify you before your featured listing expires.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  // Email to admin
  emails.push({
    to: ADMIN_EMAIL,
    subject: `New Featured Listing Purchase - ${village.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #1f2937; }
            .value { color: #4b5563; margin-left: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Featured Listing Purchase</h1>
            </div>
            <div class="content">
              <div class="section">
                <h2>Village</h2>
                <p><span class="label">Name:</span><span class="value">${village.name}</span></p>
                <p><span class="label">Location:</span><span class="value">${village.suburb}, ${village.state}</span></p>
              </div>

              <div class="section">
                <h2>Payment Details</h2>
                <p><span class="label">Amount:</span><span class="value">$${paymentDetails.amount}</span></p>
                <p><span class="label">Duration:</span><span class="value">${paymentDetails.duration} days</span></p>
                <p><span class="label">Revenue:</span><span class="value">$${paymentDetails.amount}</span></p>
              </div>

              <div class="section">
                <h2>Operator</h2>
                <p><span class="label">Email:</span><span class="value">${operatorEmail}</span></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  return emails;
}

export function operatorDataUpdateRequestEmail(village: any) {
  // Determine what data is missing
  const missingData = [];
  if (!village.entry_price_min || !village.entry_price_max) missingData.push('Entry pricing');
  if (!village.monthly_fees_min || !village.monthly_fees_max) missingData.push('Monthly fees');
  if (!village.contact_phone) missingData.push('Contact phone');
  if (!village.amenities || village.amenities.length === 0) missingData.push('Amenities');
  if (!village.care_services || village.care_services.length === 0) missingData.push('Care services');
  if (!village.description || village.description.length < 100) missingData.push('Detailed description');
  
  return {
    to: village.contact_email,
    subject: `Help Us Complete Your Village Profile - ${village.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 20px; }
            .highlight-box { background-color: #dbeafe; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; border-radius: 4px; }
            .missing-list { background-color: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 Update Your Village Profile</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              
              <p>We're reaching out because <strong>${village.name}</strong> has an incomplete profile on RetirePath.</p>

              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #2563eb;">Why Complete Your Profile?</h3>
                <ul>
                  <li>✅ <strong>Get 5x more inquiries</strong> from potential residents</li>
                  <li>✅ <strong>Appear higher in search results</strong></li>
                  <li>✅ <strong>Build trust</strong> with transparent pricing and detailed information</li>
                  <li>✅ <strong>Stand out</strong> from competitors with incomplete listings</li>
                </ul>
              </div>

              <div class="missing-list">
                <h3 style="margin-top: 0; color: #dc2626;">⚠️ Missing Information:</h3>
                <ul>
                  ${missingData.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>

              <div class="section">
                <h2>How to Update Your Profile</h2>
                <ol>
                  <li>Log in to your Operator Dashboard</li>
                  <li>Click on "Edit Village" for ${village.name}</li>
                  <li>Fill in the missing fields listed above</li>
                  <li>Click "Save Changes"</li>
                </ol>
                <p><strong>It takes just 5 minutes!</strong></p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SUPABASE_URL') || 'https://retirepath.com.au'}" class="button">Update Your Profile Now</a>
              </div>

              <div class="section">
                <h3>Need Help?</h3>
                <p>If you're having trouble updating your profile or have questions, simply reply to this email. Our team is here to help!</p>
              </div>

              <div class="footer">
                <p><strong>RetirePath</strong> - Connecting Retirees with Their Ideal Retirement Village</p>
                <p>This is an automated message sent to help improve your listing visibility.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}