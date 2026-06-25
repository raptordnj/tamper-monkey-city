# CityTouch অটো লগইন (Tampermonkey)

একটি Tampermonkey ইউজারস্ক্রিপ্ট যা [CityTouch](https://www.citytouch.com.bd/)-এ স্বয়ংক্রিয়ভাবে ইউজারনেম/পাসওয়ার্ড পূরণ করে এবং লগইন ফর্ম সাবমিট করে।

## কেন তৈরি করা হয়েছে

CityTouch খুব দ্রুত লগআউট করে দেয় — অল্প সময় নিষ্ক্রিয় থাকলেই সেশন শেষ হয়ে যায় এবং আপনাকে আবার লগইন পেজে ফিরিয়ে দেওয়া হয়। দিনে বারবার ক্রেডেনশিয়াল টাইপ করা বিরক্তিকর ও সময়সাপেক্ষ।

এই ইউজারস্ক্রিপ্টটি সেই ঝামেলা দূর করতে তৈরি। এটি নীরবে পেজটি পর্যবেক্ষণ করে, এবং যখনই লগইন ফর্ম দেখা যায় — প্রথমবার লোড হোক বা জোরপূর্বক লগআউটের পরে — স্বয়ংক্রিয়ভাবে ক্রেডেনশিয়াল পূরণ করে লগইন করিয়ে দেয়। আপনি কোনো বাধা ছাড়াই কাজে থাকতে পারেন।

## ইনস্টলেশন

1. [Tampermonkey](https://www.tampermonkey.net/) ব্রাউজার এক্সটেনশন ইনস্টল করুন:
   - [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
   - [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/)
2. **"Allow User Scripts" চালু করুন** (Chrome/Edge v138+ এ প্রয়োজন, না হলে স্ক্রিপ্ট চলবে না):
   - ব্রাউজারের **Extensions** পেজ খুলুন (`chrome://extensions` অথবা `edge://extensions`)।
   - **Tampermonkey** খুঁজে **Details**-এ ক্লিক করুন।
   - **Allow User Scripts** টগলটি চালু করুন।
   - Firefox-এ এই ধাপটি প্রয়োজন নেই।
3. Tampermonkey ড্যাশবোর্ড খুলুন → **Create a new script** (অথবা **Utilities → Import**)।
4. [`citytouch-autofill.user.js`](./citytouch-autofill.user.js) ফাইলের কনটেন্ট পেস্ট করুন এবং সেভ করুন।
5. স্ক্রিপ্টের শুরুতে **ক্রেডেনশিয়াল সম্পাদনা করুন**:
   ```js
   const USERNAME = 'your_username_here';
   const PASSWORD = 'your_password_here';
   ```
6. https://www.citytouch.com.bd/ ভিজিট করুন — ফর্ম স্বয়ংক্রিয়ভাবে পূরণ হয়ে সাবমিট হবে।

## কীভাবে কাজ করে

- সাইটটি একটি Angular SPA যা ফর্ম রেন্ডার করার আগে একটি লোডার দেখায়।
- একটি `MutationObserver` স্থায়ীভাবে পেজ পর্যবেক্ষণ করে এবং যখনই ফিল্ড দেখা যায় (প্রথম লোড বা লগআউটের পরে যেকোনো রি-রেন্ডার) তখনই পূরণ করে।
- Angular-এর রিঅ্যাক্টিভ ফর্ম যাতে মান চিনতে পারে, সেজন্য native value setter + `input` ইভেন্ট ব্যবহার করা হয়।
- পূরণের `SUBMIT_DELAY_MS` (ডিফল্ট ৫০০ মিলিসেকেন্ড) পরে সাবমিট করে।

## কনফিগারেশন (স্ক্রিপ্টের শুরুতে)

| কনস্ট্যান্ট | উদ্দেশ্য |
| --- | --- |
| `AUTO_SUBMIT` | `false` করলে শুধু পূরণ হবে, সাবমিট হবে না |
| `SUBMIT_DELAY_MS` | পূরণ ও সাবমিটের মধ্যে বিলম্ব |

> ⚠️ আপনার পাসওয়ার্ড স্ক্রিপ্টে সাদা টেক্সটে সংরক্ষিত থাকে। এটি ব্যক্তিগত রাখুন এবং কখনো আসল ক্রেডেনশিয়াল কমিটে দেবেন না।
