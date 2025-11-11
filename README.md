# 🧩 fc-dropdowns.js

Smart dropdown behavior for Webflow — built to make sections feel alive.

---

### 🚀 Features
- Opens the **default** dropdown when a section first appears.
- Remembers which dropdown the user opened last.
- Reopens the correct one when revisiting that section.
- Fully compatible with Webflow’s native dropdown logic.

---

### 🧠 Usage

1. Add the script to your Webflow project under  
   **Project Settings → Custom Code → Footer Code**

2. Republish your site.

3. Apply the following attributes in the Designer:

   ```html
   <div fc-section="features">
     <div fc-dropdown="default" class="w-dropdown">
       <div fc-dropdown-toggle="1" class="w-dropdown-toggle">...</div>
     </div>
   </div>
