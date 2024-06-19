const URL_API = "https://countriesnow.space/api/v0.1/countries/cities";
export const getCitiesByCountry = async (country) => {
  try {
    const res = await fetch(`${URL_API}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ country: country }),
    });
    const data = await res.json();
    console.log(data)
    return data.data
  } catch (error) {
    console.log(error);
    return null;
  }
};
