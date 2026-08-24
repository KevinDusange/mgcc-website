module.exports = {
    name: "Mega Global Commerce Corporation",
    email: "info@mgcc.us",
    phones: [
        {
            region: "Canada",
            numberForTel: "+17787799991",
            numberFormatted: "(778) 779-9991",
        },
        {
            region: "United States",
            numberForTel: "+17868926422",
            numberFormatted: "(786) 892-6422",
        },
    ],
    locations: [
        {
            region: "Canada",
            street: "9785 123A St.",
            city: "Surrey",
            state: "BC",
            postalCode: "V3V 4P8",
            country: "Canada",
            mapLink: "https://maps.app.goo.gl/qPP3zMZ3CcyshQNd8",
        },
        {
            region: "United States",
            street: "3227 S 162nd Street",
            city: "SeaTac",
            state: "WA",
            postalCode: "",
            country: "United States",
            mapLink: "https://www.google.com/maps/search/?api=1&query=3227%20S%20162nd%20Street%2C%20SeaTac%2C%20WA",
        },
    ],
    socials: {
        facebook: "https://www.facebook.com/",
        instagram: "https://www.instagram.com/",
    },
    //! Make sure you include the file protocol (e.g. https://) and that NO TRAILING SLASH is included
    domain: "https://mgcc.us",
    // Passing the isProduction variable for use in HTML templates
    isProduction: process.env.ELEVENTY_ENV === "PROD",
};
