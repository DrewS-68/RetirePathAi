# RetirePath Testing Checklist

**Quick reference for testing before launch**

---

## ✅ User Registration & Authentication

- [ ] Sign up with new account (Free plan)
- [ ] Sign up with Premium plan ($19/month)
- [ ] Sign up with Ultimate plan ($49/month)
- [ ] Test Stripe payment (card: 4242 4242 4242 4242)
- [ ] Test declined payment (card: 4000 0000 0000 0002)
- [ ] Legal disclaimer appears and must be accepted
- [ ] Welcome tour appears for new users
- [ ] Can skip welcome tour
- [ ] Sign out works
- [ ] Sign in works
- [ ] Session persists on page reload

---

## ✅ Village Finder Tool

- [ ] Disclaimer checkbox required to proceed
- [ ] Health questions form works
- [ ] Lifestyle questions form works
- [ ] Financial questions form works
- [ ] Results display (~1900 villages)
- [ ] Match scores calculated correctly
- [ ] Can filter results by state
- [ ] Can filter by price range
- [ ] Can sort by match score
- [ ] Village cards display correct info
- [ ] Can click to view village profile
- [ ] Mobile responsive

---

## ✅ Village Directory

- [ ] All villages load (pagination)
- [ ] Search by name works
- [ ] Search by suburb works
- [ ] Search by postcode works
- [ ] Filter by state works
- [ ] Filter by village type works
- [ ] Filter by price range works
- [ ] Can view village profile
- [ ] Images display correctly
- [ ] Reviews display
- [ ] Can submit review (logged in)
- [ ] Mobile responsive

---

## ✅ Contract Analyzer Tool

- [ ] Disclaimer checkbox required
- [ ] Can upload PDF contract
- [ ] Upload progress shows
- [ ] Analysis completes
- [ ] Risk scores display
- [ ] Cost breakdown shown
- [ ] DMF calculations correct
- [ ] Can download report
- [ ] Error handling for invalid files
- [ ] Mobile responsive

---

## ✅ Home Value Estimator Tool

- [ ] Disclaimer checkbox required
- [ ] Address autocomplete works
- [ ] Property details form works
- [ ] Valuation calculates
- [ ] Comparison properties show
- [ ] Market insights display
- [ ] Error handling for invalid address
- [ ] Mobile responsive

---

## ✅ Other Features

- [ ] Village Guide loads
- [ ] Selling Guide loads
- [ ] Resources Hub loads
- [ ] Family Guide loads
- [ ] Progress Tracker works
- [ ] About page loads
- [ ] FAQ loads (30+ questions)

---

## ✅ Mobile Testing

**Test on real devices:**
- [ ] iPhone (Safari)
- [ ] Android phone (Chrome)
- [ ] iPad (Safari)
- [ ] Android tablet (Chrome)

**Check:**
- [ ] Header displays correctly
- [ ] Logo scales appropriately
- [ ] Navigation tabs scroll horizontally
- [ ] "Swipe to see all tools" hint shows
- [ ] Button labels shortened on mobile
- [ ] Touch targets 44x44px minimum
- [ ] Text readable (not too small)
- [ ] Forms usable on touch screens
- [ ] Images load and scale correctly
- [ ] No horizontal scroll (except nav)

---

## ✅ Performance

**Chrome DevTools Network Tab:**
- [ ] Initial bundle < 1MB
- [ ] Load time < 5s on Slow 3G
- [ ] Admin tools lazy load
- [ ] Images lazy load
- [ ] No unnecessary API calls

**Lighthouse Audit:**
- [ ] Performance score > 80
- [ ] Accessibility score > 85
- [ ] Best Practices score > 90
- [ ] SEO score > 80

---

## ✅ Error Handling

**Network Errors:**
- [ ] Offline mode shows friendly error
- [ ] "Retry" button works
- [ ] App doesn't crash

**Invalid Inputs:**
- [ ] Empty forms show validation
- [ ] Invalid emails rejected
- [ ] Invalid file types rejected
- [ ] Clear error messages

**Session Expiry:**
- [ ] Redirects to login
- [ ] Can resume after login

---

## ✅ Cross-Browser Testing

- [ ] Chrome (Windows)
- [ ] Chrome (Mac)
- [ ] Firefox (Windows)
- [ ] Firefox (Mac)
- [ ] Safari (Mac)
- [ ] Safari (iOS)
- [ ] Edge (Windows)

**Check each browser:**
- [ ] Layout consistent
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

---

## ✅ Onboarding & UX

- [ ] Welcome tour auto-appears
- [ ] All 7 tour steps work
- [ ] Next/Previous buttons work
- [ ] Skip tour works
- [ ] Tour doesn't show again
- [ ] Quick Start Guide accessible
- [ ] Feature hints appear
- [ ] Hints dismissable
- [ ] Progress tracked

---

## ✅ Admin Dashboard (Admin Only)

- [ ] Admin tab only visible to admins
- [ ] Dashboard loads (lazy loaded)
- [ ] Village statistics correct
- [ ] Can approve/reject villages
- [ ] Bulk upload works
- [ ] Link images works
- [ ] Fix duplicates works
- [ ] Data cleanup tools work

---

## ✅ Payment Integration

**Test Mode Only:**
- [ ] Stripe modal opens
- [ ] Payment form loads
- [ ] Can enter test card
- [ ] Payment processes
- [ ] Account upgraded immediately
- [ ] Membership tier displayed
- [ ] Can access premium features
- [ ] Free plan has correct limits

---

## ✅ Security

- [ ] Can't access premium without login
- [ ] Can't bypass FeatureGate
- [ ] Session cleared on sign out
- [ ] No sensitive data in console
- [ ] No sensitive data in network tab
- [ ] XSS attempts sanitized
- [ ] File uploads restricted

---

## ✅ Accessibility

**Keyboard Navigation:**
- [ ] Tab key navigates correctly
- [ ] Enter/Space activates buttons
- [ ] Focus indicators visible
- [ ] Tab order logical
- [ ] Can use entire site with keyboard

**Screen Reader (NVDA/JAWS):**
- [ ] Content is readable
- [ ] Form labels announced
- [ ] Button purposes clear
- [ ] Headings structured correctly

**Color Contrast:**
- [ ] WCAG AA compliance (4.5:1)
- [ ] Text readable on backgrounds

---

## ✅ Edge Cases

- [ ] Very long village names
- [ ] Villages with no images
- [ ] Villages with missing data
- [ ] Empty search results
- [ ] No villages in filter
- [ ] Upload very large PDF (10MB+)
- [ ] Upload very small PDF (< 100KB)
- [ ] Multiple simultaneous API calls
- [ ] Rapid clicking/navigation
- [ ] Browser back button

---

## ✅ Data Accuracy

- [ ] Village count correct (~1900)
- [ ] Pricing displays correctly
- [ ] States display correctly
- [ ] Contact info correct
- [ ] Images display correct villages
- [ ] Links work (websites, emails)

---

## 🐛 Bugs Found

**Track issues here:**

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
4. _______________________________________________
5. _______________________________________________

---

## 📊 Test Results Summary

**Date Tested:** _______________

**Tester:** _______________

**Overall Assessment:**
- [ ] Ready for launch
- [ ] Minor fixes needed
- [ ] Major fixes needed

**Critical Issues:** _______________

**Nice-to-Have Improvements:** _______________

---

## ✅ Final Sign-Off

Before launching to production:

- [ ] All HIGH priority tests passed
- [ ] No critical bugs remain
- [ ] Mobile experience smooth
- [ ] Payment integration tested
- [ ] Legal disclaimers working
- [ ] Performance acceptable
- [ ] Cross-browser compatible
- [ ] Accessibility verified
- [ ] Admin tools working
- [ ] Error handling robust

**Approved by:** _______________

**Date:** _______________

**Signature:** _______________

---

## 🚀 Launch Readiness: [  ]%

**Next Steps:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

Last Updated: January 2026
Version: 1.0.0
