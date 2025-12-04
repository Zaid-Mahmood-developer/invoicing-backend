// export const getFBRToken = async () => {
//   try {
//     const response = await fetch("https://api.fbr.gov.pk/oauth/token", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         username: "YOUR_FBR_USERNAME",
//         password: "YOUR_FBR_PASSWORD",
//         grant_type: "password", // sometimes "client_credentials"
//         client_id: "YOUR_CLIENT_ID",
//         client_secret: "YOUR_CLIENT_SECRET",
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error_description || "Failed to fetch FBR token");
//     }

//     console.log("✅ FBR Token fetched successfully:", data.access_token);
//     return data.access_token;

//   } catch (error) {
//     console.error("❌ Error fetching FBR token:", error.message);
//     return null;
//   }
// };