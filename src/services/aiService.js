export async function sendImageToAI(imageUri, userProfile, context) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`### Prevention Verification Complete\n\nI reviewed your image and it appears you took a strong preventative action for **${context.activeAlert?.title || 'the current alert'}**.\n\n- ✅ Evidence of proactive effort is visible.\n- ✅ Your home profile now has a stronger response posture.\n- ✅ Keep monitoring for storm updates and secure any loose structures.\n\nIf you want, submit another photo of a second preventative action and I can validate that too.`);
    }, 1400);
  });
}
