// ============================================================
// 🔌 AI SERVICE — INTEGRATION SOCKET
// Replace the mock responses below with your real AI model.
// The function signature stays the same — just swap the body.
// ============================================================

// Step-by-step prevention guides keyed by alert type.
// Each step has a prompt (what the AI asks the user to photograph)
// and a response (what the AI says after seeing the photo).
const PREVENTION_STEPS = {
  flood: [
    {
      prompt: "Let's start with your basement. Take a photo of your floor drain or sump pump area so I can assess your flood readiness.",
      response: "✅ Great — your drain area looks clear and accessible. This is your first line of defence against water backup.\n\nNext, I need to check your exterior.",
    },
    {
      prompt: "Now head outside. Take a photo of your downspout extensions and the ground slope away from your foundation.",
      response: "✅ Your downspout positioning looks good. Water should be directed away from the foundation effectively.\n\nOne more critical check.",
    },
    {
      prompt: "Finally, take a photo of any valuables or electronics near the floor — we want to make sure they're elevated.",
      response: "✅ Smart move getting those elevated. You've completed all three flood prevention checks.\n\n🛡️ Your home is in a strong protective posture. Monitor water levels and stay tuned to local alerts.",
    },
  ],
  wind: [
    {
      prompt: "Let's start outside. Take a photo of your patio furniture, planters, or any loose items in your yard.",
      response: "✅ Good — those items need to be brought inside or secured with straps before the storm hits.\n\nLet's check your windows next.",
    },
    {
      prompt: "Take a photo of your windows and doors. We're checking for gaps, loose frames, or anything that could let wind in.",
      response: "✅ Your windows look structurally sound. If you have storm shutters, now is the time to close them.\n\nLast step — your roof.",
    },
    {
      prompt: "If safely accessible, take a photo of your roof line or eavestroughs. We're looking for loose shingles or debris buildup.",
      response: "✅ Roof check complete. Clear any debris from gutters if safe to do so.\n\n🛡️ All wind preparation steps verified. Stay indoors once the storm arrives.",
    },
  ],
  fire: [
    {
      prompt: "Start at your main electrical panel. Take a photo so I can confirm it's accessible and not blocked.",
      response: "✅ Panel is accessible — important in case you need to cut power quickly.\n\nLet's check your smoke detectors.",
    },
    {
      prompt: "Take a photo of your nearest smoke detector. We're checking it's mounted, unobstructed, and has no warning lights.",
      response: "✅ Smoke detector looks properly installed. Test it by pressing the test button if you haven't recently.\n\nOne final check.",
    },
    {
      prompt: "Take a photo of your fire extinguisher and its pressure gauge.",
      response: "✅ Extinguisher confirmed present. Make sure the gauge needle is in the green zone.\n\n🛡️ Your fire prevention checks are complete. Keep evacuation routes clear and stay alert.",
    },
  ],
  // Default fallback for any other alert type
  default: [
    {
      prompt: "Take a photo of the area of your home most at risk from this weather event so I can assess your current situation.",
      response: "✅ Thanks for sharing that. Based on what I can see, your preparation efforts are visible and meaningful.\n\nLet's check one more area.",
    },
    {
      prompt: "Now take a photo of any emergency supplies you have ready — flashlights, water, first aid kit.",
      response: "✅ Great — having emergency supplies accessible is critical during any weather event.\n\n🛡️ You've completed your safety verification. Stay safe and keep monitoring updates.",
    },
  ],
};

// ============================================================
// 🔌 REPLACE THIS FUNCTION WITH YOUR REAL AI MODEL CALL
// Inputs:
//   imageUri    — local URI of the photo taken by the user
//   userProfile — object from AppContext (home type, features etc.)
//   context     — { activeAlert, currentStep }
// Output:
//   { responseText, nextPrompt, isComplete }
// ============================================================
export async function sendImageToAI(imageUri, userProfile, context) {
  return new Promise((resolve) => {
    const alertType = context.activeAlert?.type || 'default';
    const steps = PREVENTION_STEPS[alertType] || PREVENTION_STEPS.default;
    const currentStep = context.currentStep ?? 0;
    const step = steps[currentStep];
    const isComplete = currentStep >= steps.length - 1;
    const nextStep = steps[currentStep + 1];

    setTimeout(() => {
      resolve({
        responseText: step?.response || "✅ Action verified. Well done.",
        nextPrompt: isComplete ? null : nextStep?.prompt,
        isComplete,
      });
    }, 1800);
  });
}

// Returns the opening prompt for a given alert type
export function getOpeningPrompt(alertType) {
  const steps = PREVENTION_STEPS[alertType] || PREVENTION_STEPS.default;
  return steps[0]?.prompt || "Take a photo of a preventative step you've completed.";
}
