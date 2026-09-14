# RetirePath - Production Readiness Checklist
**Date:** January 28, 2026  
**Current Status:** Fine-tuning for launch

---

## 🎯 CRITICAL - Must Have Before Launch

### ✅ COMPLETED
- [x] **Legal disclaimers on tools** - Contract Analyzer, Home Value Estimator have mandatory acknowledgments
- [x] **Tool name changes** - Removed "advice" terminology
- [x] **Comprehensive legal dialog** - Shows on first login
- [x] **Terms of Service** - Basic version in footer
- [x] **Privacy Policy** - Basic version in footer
- [x] **Stripe payment integration** - Working with 3 membership tiers
- [x] **Supabase authentication** - User login/signup working
- [x] **~1900 villages in database** - Confirmed 100% accurate
- [x] **Non-auto-renewing subscriptions** - Good for ACL compliance

### ❌ STILL NEEDED - CRITICAL

#### 1. **Refund Policy Page** 🔴 HIGH PRIORITY
**Status:** Missing  
**Required by:** Australian Consumer Law, Stripe  
**Action:** Create dedicated refund policy page
**Suggested Content:**
```
REFUND POLICY

7-Day Money-Back Guarantee:
- If you're not satisfied within 7 days of purchase, contact us for a full refund
- No questions asked for refunds within first 7 days
- Refunds processed within 5-10 business days to original payment method

After 7 Days:
- No refunds available after the 7-day cooling-off period
- Subscriptions are non-auto-renewing (no recurring charges)
- Your access continues until subscription expiry date

How to Request a Refund:
- Email: support@retirepath.com.au
- Subject: "Refund Request"
- Include: Your email, purchase date, reason (optional)

Consumer Guarantee Rights:
- Australian Consumer Law provides consumer guarantees that cannot be excluded
- If our services have major problems, you have additional rights
- Contact us to discuss any service issues

Processing Time: 5-10 business days
Questions: support@retirepath.com.au
```

#### 2. **Professional Legal Review** 🔴 ESSENTIAL
**Status:** Not started  
**Cost:** $5,000-15,000  
**Timeline:** 2-4 weeks  
**Action Required:**
- [ ] Book consultation with LawPath or tech startup lawyer
- [ ] Prepare business overview document
- [ ] Get T&Cs, Privacy Policy, and disclaimers reviewed
- [ ] Obtain sign-off that platform is legally compliant

**Lawyers to Contact:**
- LawPath (lawpath.com.au) - $2,500-3,500
- Local tech/startup lawyers - $300-600/hour

#### 3. **Professional Indemnity Insurance** 🔴 ESSENTIAL
**Status:** Not confirmed  
**Cost:** $2,000-5,000/year  
**Coverage:** $2-5 million recommended  
**Action Required:**
- [ ] Get 3 quotes from BizCover, InsuranceHQ, DUAL Australia
- [ ] Purchase policy BEFORE launch
- [ ] Add proof of insurance to legal documents

**Why Essential:**
- You're providing contract analysis and valuations
- One lawsuit could bankrupt the business
- Cannot get retroactive coverage

#### 4. **Company Registration & Business Structure** 🔴 CRITICAL
**Status:** Unknown  
**Action Required:**
- [ ] Confirm if company is registered as Pty Ltd
- [ ] If not, register company with ASIC ($538)
- [ ] Obtain ACN and ABN
- [ ] Register business name "RetirePath" ($37/year)
- [ ] Consider trademark application ($330-400)

---

## ⚠️ IMPORTANT - Should Have Before Launch

### 5. **Missing Legal Pages in Footer**
**Status:** Partially complete  
**Action Required:**

#### a. **Cookie Policy** 
**Why needed:** Privacy compliance, user transparency  
**Content:**
```
COOKIE POLICY

What Are Cookies:
Cookies are small text files stored on your device when you visit websites.

Cookies We Use:
- Essential cookies: Required for login and basic functionality
- Analytics cookies: Help us understand how users interact with RetirePath
- Preference cookies: Remember your settings and preferences

Managing Cookies:
- You can control cookies through your browser settings
- Disabling cookies may affect site functionality
- Essential cookies cannot be disabled

Third-Party Cookies:
- Stripe (payment processing)
- Supabase (authentication and data storage)
- Analytics providers (if applicable)

Questions: privacy@retirepath.com.au
```

#### b. **Acceptable Use Policy**
**Why needed:** Legal protection, user conduct rules  
**Content:**
```
ACCEPTABLE USE POLICY

Prohibited Activities:
You may not:
- Provide false information when signing up
- Share your account credentials
- Attempt to breach security measures
- Submit fake village reviews
- Use automated tools to scrape data
- Harass other users or village operators
- Use the platform for any illegal purpose

Village Reviews:
- Reviews must be truthful and based on genuine experience
- No defamatory, offensive, or discriminatory content
- No fake reviews or reviews for compensation
- RetirePath reserves the right to remove inappropriate reviews

Consequences:
- Account suspension or termination
- Legal action for serious violations
- Reporting to authorities if illegal activity suspected

Report Violations: support@retirepath.com.au
```

#### c. **Accessibility Statement**
**Why needed:** Disability Discrimination Act compliance  
**Content:**
```
ACCESSIBILITY STATEMENT

Our Commitment:
RetirePath is committed to ensuring digital accessibility for people with disabilities.
We continually work to improve accessibility and usability of our platform.

Current Accessibility Features:
- Keyboard navigation support
- Screen reader compatibility
- Text resizing options
- Color contrast considerations
- Alternative text on images

Known Limitations:
- [List any known accessibility issues]
- We are actively working to address these

Feedback:
If you encounter accessibility barriers, please contact us:
- Email: accessibility@retirepath.com.au
- We will work with you to provide alternative access

Standards:
We aim to conform to WCAG 2.1 Level AA standards.
```

### 6. **Contact & Support Pages**
**Status:** Email addresses in footer only  
**Action Required:**
- [ ] Create dedicated "Contact Us" page
- [ ] Add contact form (not just email)
- [ ] List hours of operation
- [ ] Add phone number (if applicable)
- [ ] Create "Help Center" or FAQ page

### 7. **About Page**
**Status:** Missing  
**Action Required:**
- [ ] Create "About RetirePath" page
- [ ] Explain mission and values
- [ ] Team information (if applicable)
- [ ] Why RetirePath was created
- [ ] How it helps retirees

---

## 📱 USER EXPERIENCE IMPROVEMENTS

### 8. **Error Handling & User Feedback**
**Check:**
- [ ] Payment failures show clear error messages
- [ ] Network errors are handled gracefully
- [ ] Form validation errors are user-friendly
- [ ] 404 page exists and is helpful
- [ ] 500 error page exists
- [ ] Loading states on all async operations

### 9. **Mobile Responsiveness**
**Test on:**
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad/tablets
- [ ] Small screens (< 375px)
- [ ] All tools work on mobile
- [ ] Payment flow works on mobile
- [ ] Navigation is touch-friendly

### 10. **Performance Optimization**
**Check:**
- [ ] Village directory loads quickly with 1900 villages
- [ ] Images are optimized (compressed, lazy-loaded)
- [ ] Database queries are optimized
- [ ] No unnecessary re-renders
- [ ] Bundle size is reasonable
- [ ] Lighthouse score > 90 (if possible)

### 11. **Loading States**
**Ensure loading indicators on:**
- [ ] Village directory search
- [ ] Contract analysis
- [ ] Home valuation calculation
- [ ] Payment processing
- [ ] User login/signup
- [ ] Data fetching

---

## 🔐 SECURITY & DATA

### 12. **Security Audit**
**Check:**
- [ ] No API keys exposed in frontend
- [ ] SUPABASE_SERVICE_ROLE_KEY never sent to client
- [ ] All backend routes properly secured
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection (if applicable)
- [ ] Rate limiting on API endpoints

### 13. **Data Privacy**
**Verify:**
- [ ] User data is encrypted at rest (Supabase handles this)
- [ ] Passwords are hashed (Supabase Auth handles this)
- [ ] Payment data never stored (Stripe handles this)
- [ ] User can delete their account
- [ ] User can export their data
- [ ] Gdpr compliance (if serving EU users)

### 14. **Email Notifications**
**Test all emails work:**
- [ ] Welcome email on signup
- [ ] Payment confirmation email
- [ ] Password reset email
- [ ] Subscription expiry reminders (if implemented)
- [ ] Emails are professional and branded
- [ ] Unsubscribe link works (if applicable)

---

## 📊 ANALYTICS & TRACKING

### 15. **Analytics Setup**
**Recommended:**
- [ ] Google Analytics 4 installed (optional)
- [ ] Conversion tracking for signups
- [ ] Conversion tracking for payments
- [ ] Track which villages are most viewed
- [ ] Track tool usage (Contract Analyzer, Home Estimator, Village Finder)
- [ ] Track user journey from hero → tools

### 16. **Error Logging**
**Setup:**
- [ ] Server-side error logging (console.log exists)
- [ ] Client-side error logging (Error Boundary exists?)
- [ ] Payment error tracking
- [ ] API failure tracking

---

## 💬 CONTENT & MARKETING

### 17. **SEO Optimization**
**Check:**
- [ ] Meta titles on all pages
- [ ] Meta descriptions on all pages
- [ ] Open Graph tags for social sharing
- [ ] Sitemap.xml exists
- [ ] Robots.txt configured correctly
- [ ] Village pages have unique meta titles/descriptions
- [ ] Schema markup for villages (structured data)

### 18. **Content Completeness**
**Review:**
- [ ] All village profiles have complete information
- [ ] Placeholder text removed
- [ ] Broken links checked
- [ ] Images all loading correctly
- [ ] No "Lorem ipsum" text anywhere
- [ ] All tooltips and help text are clear

### 19. **FAQ Section**
**Status:** Not found  
**Create FAQ covering:**
- How does RetirePath work?
- Is RetirePath free?
- How accurate is the Contract Analyzer?
- How accurate is the Home Value Estimator?
- How do I cancel my subscription?
- How do I get a refund?
- Is my data secure?
- Do you provide legal/financial advice? (Answer: NO)
- How do I report incorrect village information?

### 20. **Social Proof**
**Consider adding:**
- [ ] User testimonials (if you have any)
- [ ] Number of villages ("Explore 1,900+ retirement villages")
- [ ] Number of users (if significant)
- [ ] Trust badges (if applicable)

---

## 🔧 TECHNICAL POLISH

### 21. **Browser Compatibility**
**Test on:**
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Older browsers (graceful degradation)

### 22. **Stripe Integration Testing**
**Verify:**
- [ ] Test mode transactions work
- [ ] Live mode transactions work
- [ ] 3D Secure (SCA) works correctly
- [ ] Payment failures are handled
- [ ] Receipt emails are sent
- [ ] Subscription status updates correctly
- [ ] Expired subscriptions lock premium features

### 23. **Database Health**
**Check:**
- [ ] All 1,900 villages have complete data
- [ ] No duplicate villages
- [ ] Images are all accessible
- [ ] Pricing data is current
- [ ] Contact information is accurate
- [ ] Database backups are configured

---

## 🚀 PRE-LAUNCH FINAL CHECKS

### 24. **User Testing**
**Before launch:**
- [ ] Test complete user journey (signup → payment → use tools → results)
- [ ] Test on different devices
- [ ] Get 3-5 beta users to test
- [ ] Fix any confusion points
- [ ] Ensure elderly users can navigate easily (your target audience!)

### 25. **Copy & Spelling**
**Review:**
- [ ] Spell check all content
- [ ] Grammar check
- [ ] Consistent terminology (e.g., "retirement village" not "village" sometimes)
- [ ] Professional tone throughout
- [ ] Australian English spelling (not US)

### 26. **Launch Checklist Items**
**Day before launch:**
- [ ] All environment variables set correctly
- [ ] Database is production-ready
- [ ] Stripe is in live mode
- [ ] Professional indemnity insurance active
- [ ] Legal review complete
- [ ] Backup plan if site goes down
- [ ] Support email monitored
- [ ] Social media accounts ready (if applicable)

---

## 🎯 PRIORITY ORDER FOR IMPLEMENTATION

### THIS WEEK (Must Do):
1. ✅ Create **Refund Policy** page
2. ✅ Create **Cookie Policy** page
3. ✅ Create **Acceptable Use Policy** page
4. ✅ Create **Accessibility Statement** page
5. 📞 Book legal consultation
6. 📞 Get insurance quotes
7. ✅ Test all tools on mobile

### NEXT WEEK (Before Launch):
1. Complete legal review with lawyer
2. Purchase professional indemnity insurance
3. Create About page
4. Create FAQ page
5. Create proper Contact page
6. Test complete user journey with 5 people
7. Fix any bugs found in testing

### WITHIN 30 DAYS (Post-Launch OK):
1. Set up analytics tracking
2. Monitor error logs
3. Gather user feedback
4. Create help documentation
5. Build email notification system
6. Accessibility audit

---

## 📋 SUMMARY

**Critical Blockers (Can't launch without):**
- 🔴 Refund Policy page
- 🔴 Professional legal review
- 🔴 Professional indemnity insurance
- 🔴 Company registration confirmed

**Important (Should have):**
- 🟡 Cookie Policy
- 🟡 Acceptable Use Policy
- 🟡 Accessibility Statement
- 🟡 Mobile testing
- 🟡 Error handling review

**Nice to Have (Can do post-launch):**
- 🟢 FAQ section
- 🟢 About page
- 🟢 Analytics setup
- 🟢 Social proof

---

**Estimated Time to Launch-Ready:**
- If you do legal review in parallel: 2-3 weeks
- If you wait for legal review: 4-6 weeks

**Estimated Budget:**
- Legal: $5,000-15,000
- Insurance: $2,000-5,000/year
- Company registration: $500-1,000 (if needed)
- **Total: $7,500-21,000 first year**

---

Created: January 28, 2026  
Version: 1.0
