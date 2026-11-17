// Single source of truth for FAQs shown on the FAQ page and in short form on landing pages.
export const FAQS = {
  customer: [
    ["How are professionals verified?", "Every Area Partner goes through business KYC, bank and document checks before going live. Each professional on their team is ID-verified and approved before they can take a job."],
    ["Can I choose my own professional?", "Yes. Either let us send the nearest available pro, or pick a specific provider from the list on the service page — you'll see their rating and distance."],
    ["What if the job needs extra work?", "The pro adds the extra work in the app with the price. Nothing is charged unless you approve it."],
    ["How do I pay?", "Choose “Pay after service” (cash or UPI) or pay online at booking. You'll get a clear bill with every item."],
    ["Can I cancel or reschedule?", "Yes, from My Bookings. Cancelling well before the slot is free; a small fee may apply close to the visit time. You'll always see the fee before you confirm."],
    ["Is my address safe?", "Your exact address is shared only with the partner who accepts your job, and only for that booking."],
    ["Does the pro bring tools and supplies?", "For many services, yes. The service page shows whether a kit is included or optional, and any kit charge is shown before you book."],
    ["Can I tip the professional?", "Yes. After the job is completed you can add a tip from the booking screen — 100% of it goes to the professional."],
  ],
  partner: [
    ["Who can join as a partner?", "Any local service business or skilled professional who can run a small team — plumbers, electricians, cleaning agencies, security agencies, caregivers and more. You need valid KYC and a bank account."],
    ["How much does it cost?", "There is no joining fee. Once you're approved you choose a monthly plan; higher plans have a lower commission per completed booking."],
    ["When is commission charged?", "Only when a booking is completed. Commission is on the service value only — materials, kit charges and tips are not commissioned. GST applies on the commission."],
    ["How do I get paid?", "For online payments, your net earning is added to your Homigo wallet and paid to your bank on the settlement cycle. For cash jobs you keep the cash, and the commission is adjusted from your wallet."],
    ["How long does verification take?", "Usually 1–3 working days after all documents are uploaded. You can track the status and fix any rejected document from your dashboard."],
    ["Can I choose which jobs to take?", "Yes. New jobs near you show up as requests with a timer — accept the ones you want. Bookings made directly for you need to be accepted within the SLA time."],
    ["Which documents do I need?", "PAN, Aadhaar (masked copy), business proof such as Udyam / shop licence / GST if you have one, address proof, and a cancelled cheque or passbook for your bank account. Each coworker needs an ID proof."],
  ],
  pro: [
    ["How do I join as a professional?", "Ask the Area Partner you work with to add you to their team in Homigo. Once your ID is verified, you can log in with your phone number."],
    ["How do I start a job?", "Mark “On the way”, then “Arrived” at the customer's door. Ask the customer for the start OTP — the job begins only after it's verified."],
    ["What if the customer needs extra work?", "Add the extra work or material with its price in the app. The customer approves it on their phone before it's added to the bill."],
    ["Do I get tips?", "Yes. Tips that customers add after a completed job are shown in your app and go fully to you."],
  ],
};

export const FAQ_TABS = [
  ["customer", "Customers"],
  ["partner", "Partners"],
  ["pro", "Professionals"],
];
