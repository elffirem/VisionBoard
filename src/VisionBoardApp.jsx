import React, { useState, useEffect } from "react";
import { toPng } from "html-to-image";

/**
 * Tüm adımlar:
 * start -> category -> gender -> loading -> gallery -> final
 * 
 * - Her sayfada geri butonu 
 * - Category butonlarının sabit boyutu
 * - Gender ekranı tam ortalı (vertical & horizontal)
 * - Finalde phone: 720×1280, laptop: 1920×1080
 * - Justified collage with leftover 'sticker' approach
 */
export default function VisionBoardApp() {
  const [step, setStep] = useState("start");

  // Pexels fetch data
  const [items, setItems] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [gender, setGender] = useState(null);
  const [loadingImages, setLoadingImages] = useState(false);

  // Kullanıcının seçtiği görseller
  const [selectedImages, setSelectedImages] = useState([]);
  const MIN_IMAGES = 8; // en az 8 resim

  // Final -> phone/laptop
  const [deviceSize, setDeviceSize] = useState("phone");

 // Kategorileriniz
 const categories = [
  "💪 Health", "❤️ Love", "✈️ Travel", "💼 Career", "🏋 Fitness",
  "💰 Wealth", "🏆 Success", "😊 Happiness", "💡 Confidence", "💎 Luxury",
  "♿ Self-care", "🎨 Creativity", "📈 Growth", "🧨‍♂ Spirituality", "🧠 Mindfulness",
  "🤝 Friendship", "👨‍👩‍👧‍👦 Family", "☮️ Peace", "🌍 Adventure", "🌟 Inspiration",
  "🏠 Home", "🚗 Car", "👗 Fashion", "💄 Beauty", "🥊 Freedom", "📚 Learning",
  "🧑‍💼 Leadership", "⚡ Power", " Minimalism", "⚖️ Balance"
];

// Gender
const genders = ["Male", "Female", "Rather not say"];

// Synonyms Map (her kategori için 5 kelime), tam liste
const synonymsMap = {
  Health: ["health", "wellness", "healthy", "fitness", "lifestyle"],
  Love: ["love", "romance", "affection", "couple", "valentine"],
  Travel: ["travel", "vacation", "trip", "tourism", "journey"],
  Career: ["career", "job", "profession", "workplace", "occupation"],
  Fitness: ["fitness", "gym", "workout", "exercise", "muscle"],
  Wealth: ["wealth", "abundance", "money", "finance", "prosperity"],
  Success: ["success", "achievement", "victory", "accomplishment", "winning"],
  Happiness: ["happiness", "joy", "bliss", "positivity", "cheerful"],
  Confidence: ["confidence", "self-esteem", "assertiveness", "boldness", "belief"],
  Luxury: ["luxury", "opulence", "premium", "lavish", "high-end"],
  "Self-care": ["self-care", "selflove", "pampering", "wellbeing", "relaxation"],
  Creativity: ["creativity", "artistic", "inspiration", "imagination", "innovation"],
  Growth: ["growth", "development", "progress", "improvement", "evolution"],
  Spirituality: ["spirituality", "spiritual", "meditation", "mindfulness", "zen"],
  Mindfulness: ["mindfulness", "awareness", "presence", "calm", "serenity"],
  Friendship: ["friendship", "companionship", "buddies", "mates", "closeness"],
  Family: ["family", "relatives", "parents", "kids", "household"],
  Peace: ["peace", "tranquility", "serenity", "calmness", "harmony"],
  Adventure: ["adventure", "exploration", "expedition", "thrill", "quest"],
  Inspiration: ["inspiration", "motivation", "aspiration", "creativity", "spark"],
  Home: ["home", "house", "residence", "interior", "comfort"],
  Car: ["car", "vehicle", "automobile", "sports car", "luxury car"],
  Fashion: ["fashion", "style", "clothes", "runway", "outfit"],
  Beauty: ["beauty", "glamour", "makeup", "skincare", "attractiveness"],
  Freedom: ["freedom", "liberty", "independence", "free spirit", "release"],
  Learning: ["learning", "education", "study", "knowledge", "academic"],
  Leadership: ["leadership", "leader", "management", "guidance", "authority"],
  Power: ["power", "strength", "force", "might", "influence"],
  Minimalism: ["minimalism", "simplicity", "declutter", "essentialism", "clean design"],
  Balance: ["balance", "equilibrium", "stability", "harmony", "moderation"]
}

  // Tüm sayfalarda back butonu
  function goBack() {
    if (step === "start") {
      // Start'ta tıklayınca yine start
      setStep("start");
    } else if (step === "category") {
      setStep("start");
    } else if (step === "gender") {
      setStep("category");
    } else if (step === "loading") {
      setStep("gender");
    } else if (step === "gallery") {
      setStep("loading");
    } else if (step === "final") {
      setStep("gallery");
    }
  }

  // STEPS
  function handleStartToCategory() {
    setStep("category");
  }
  function handleCategoryContinue() {
    setStep("gender");
  }
  function handleNextStep() {
    setStep("loading");
    setTimeout(() => {
      fetchImagesFromPexels();
      setStep("gallery");
    }, 2000);
  }

  // Pexels fetch
  async function fetchImagesFromPexels() {
    setLoadingImages(true);
    const apiKey = "62YEs67oU6gyFvBpmSndP4PCz5UnGgipmm1F7HXSqfLyh16OYBXA9rjG"; // Buraya kendi Pexels API Key'inizi koyun
    const fetched = [];

    for (const rawCat of selectedCategories) {
      const clean = rawCat.replace(/^[^a-zA-Z]+/, "").trim();
      const synonyms = synonymsMap[clean] || [clean];
      let finalImages = [];

      for (const w of synonyms) {
        let query = w;
        if (gender === "Male" || gender === "Female") {
          query = `${gender.toLowerCase()} ${w}`;
        }
        try {
          const resp = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20`,
            { headers: { Authorization: apiKey } }
          );
          const data = await resp.json();
          const images = data?.photos?.map((p) => p.src.medium) || [];
          if (images.length > 0) {
            finalImages = images;
            break;
          }
        } catch (err) {
          console.error("Pexels error:", err);
        }
      }
      fetched.push({ text: clean, images: finalImages });
    }
    setItems(fetched);
    setLoadingImages(false);
  }

  // Kategori butonu tıklama
  function toggleCategory(cat) {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((x) => x !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  }

  // Gallery -> final
  function handleGalleryContinue() {
    if (selectedImages.length < MIN_IMAGES) {
      alert(`Please select at least ${MIN_IMAGES} images.`);
      return;
    }
    setStep("final");
  }

  // Görsel ekle/çıkar
  function handleImageClick(url) {
    if (selectedImages.includes(url)) {
      setSelectedImages(selectedImages.filter((x) => x !== url));
    } else {
      setSelectedImages([...selectedImages, url]);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#f9f9f9] font-serif relative">

      {/* BACK BUTONU => her sayfada */}
      <button
        onClick={goBack}
        className="absolute top-6 left-6 text-white text-2xl bg-black/40 p-2 rounded-full hover:bg-black/60"
      >
        ←
      </button>

      {/* 1) START */}
      {step==="start" && (
        <section className="h-screen flex flex-col justify-center items-center text-center px-4 bg-[url('https://images.unsplash.com/photo-1612832021234-75e32657bcb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative z-10 w-full flex flex-col items-center">
            <h1 className="text-6xl font-light italic mb-6 tracking-wide text-[#f9f9f9]">
              Visualize. Believe. Become.
            </h1>
            <p className="text-xl text-[#dcdcdc] mb-10 max-w-3xl text-center">
              Your future deserves nothing less.
            </p>
            <div className="relative w-full h-[80px] flex items-center justify-center overflow-hidden">
              <div className="absolute left-[-50%] w-[200%] h-full bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_rgba(255,255,255,0)_70%)] animate-[shimmer_3s_linear_infinite] blur-sm" />
              <div className="relative z-10 w-full max-w-md mx-auto overflow-hidden rounded-full">
                <button
                  onClick={handleStartToCategory}
                  className="w-full px-10 py-5 bg-gradient-to-r from-[#C8B560] to-[#FDE8B3] text-black rounded-full hover:opacity-90 transition text-lg tracking-wide shadow-xl uppercase"
                >
                  Create My Board
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2) CATEGORY */}
      {step==="category" && (
        <section className="px-6 py-24 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-[#f6e7d7] tracking-wide uppercase">
              Choose Your Themes
            </h2>
            <p className="text-lg mt-4 text-[#b8b8b8] max-w-2xl mx-auto italic">
              What do you want to attract into your life?
            </p>
          </div>

          {/* Kategori sabit boyut butonlar => w-32 h-12 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center mb-16">
            {categories.map((cat, i)=> (
              <button
                key={i}
                onClick={()=> toggleCategory(cat)}
                className={`w-32 h-12 text-sm rounded-full border transition-all duration-300 flex items-center justify-center ${
                  selectedCategories.includes(cat)
                    ? "bg-[#C8B560] text-black border-[#C8B560] shadow-md"
                    : "bg-transparent border-[#777] text-[#f9f9f9] hover:border-[#C8B560] hover:text-[#C8B560]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleCategoryContinue}
              className="mt-10 px-10 py-4 bg-gradient-to-r from-[#C8B560] to-[#FDE8B3] text-black rounded-full text-lg font-semibold hover:opacity-90 transition"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {/* 3) GENDER */}
      {step==="gender" && (
        <section className="h-screen flex flex-col items-center justify-center text-center px-4">
          <h3 className="text-3xl font-light text-[#f6e7d7] mb-6">
            Select Your Gender
          </h3>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {genders.map((g, i)=> (
              <button
                key={i}
                onClick={()=> setGender(g)}
                className={`px-6 py-3 text-sm rounded-full border transition-all duration-300 ${
                  gender===g
                    ? "bg-[#C8B560] text-black border-[#C8B560] shadow-md"
                    : "bg-transparent border-[#777] text-[#f9f9f9] hover:border-[#C8B560] hover:text-[#C8B560]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <button
            onClick={handleNextStep}
            className="px-10 py-4 bg-gradient-to-r from-[#C8B560] to-[#FDE8B3] text-black rounded-full text-lg font-semibold hover:opacity-90 transition"
          >
            Continue
          </button>
        </section>
      )}

      {/* 4) LOADING */}
      {step==="loading" && (
        <section className="h-screen flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-4xl text-[#f6e7d7] font-light mb-4 animate-pulse">
            Collecting your dreams...
          </h2>
          <p className="text-lg text-[#ccc]">
            Please wait while we prepare your personal vision board ✨
          </p>
        </section>
      )}

      {/* 5) GALLERY */}
      {step==="gallery" && (
        <section className="min-h-screen flex flex-col items-center text-center px-4">
          <h2 className="text-5xl font-light text-[#f6e7d7] mb-10 mt-8">
            Your Vision Board
          </h2>

          {loadingImages ? (
            <p className="text-xl italic text-[#ccc] animate-pulse">
              Loading images...
            </p>
          ) : (
            <div className="w-full max-w-4xl">
              {items.length===0 ? (
                <p className="text-lg italic">
                  No images found. (Try other categories?)
                </p>
              ) : (
                <ul className="space-y-10">
                  {items.map((item, catIndex)=> (
                    <li key={catIndex}>
                      <h3 className="text-sm text-[#C8B560] font-semibold mb-3">
                        {item.text}
                      </h3>
                      {item.images && item.images.length>0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {item.images.map((imgUrl, imgIndex)=> {
                            const isSelected = selectedImages.includes(imgUrl);
                            return (
                              <div
                                key={imgIndex}
                                onClick={()=>handleImageClick(imgUrl)}
                                className="relative cursor-pointer"
                              >
                                <img
                                  src={imgUrl}
                                  alt="vision"
                                  className="block w-full h-auto rounded-md"
                                />
                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-[#C8B560] text-black text-xs font-semibold px-2 py-1 rounded shadow-md">
                                    ✓
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm italic">
                          No images found for this category.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-10 mb-12">
            <button
              onClick={()=>{
                if (selectedImages.length<MIN_IMAGES) {
                  alert(`Please select at least ${MIN_IMAGES} images.`);
                  return;
                }
                setStep("final");
              }}
              className="px-10 py-4 bg-gradient-to-r from-[#C8B560] to-[#FDE8B3] text-black rounded-full text-lg font-semibold hover:opacity-90 transition"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {/* 6) FINAL */}
      {step==="final" && (
        <FinalCollage
          selectedImages={selectedImages}
          deviceSize={deviceSize}
          setDeviceSize={setDeviceSize}
          minImages={MIN_IMAGES}
          goBack={goBack}
        />
      )}
    </div>
  );
}

/** 
 * FinalCollage
 * - phone => 720×1280
 * - laptop => 1920×1080
 * - leftover sticker approach
 */
function FinalCollage({ selectedImages, deviceSize, setDeviceSize, minImages, goBack }) {
  if (selectedImages.length < minImages) {
    return (
      <section className="min-h-screen px-6 py-16 bg-[#0F0F0F] text-white text-center relative">
        <button
          onClick={goBack}
          className="absolute top-6 left-6 text-white text-2xl bg-black/40 p-2 rounded-full hover:bg-black/60"
        >
          ←
        </button>
        <h2 className="text-4xl text-[#f6e7d7] font-light mb-6">
          Your Vision Board
        </h2>
        <p className="text-lg text-[#ccc]">
          You have fewer than {minImages} images selected.
        </p>
      </section>
    );
  }

  // phone => 720 wide, 1280
  // laptop => 1920 wide, 1080
  const containerWidth = deviceSize==="phone" ? 720 : 1920;

  function handleDownloadCollage() {
    setTimeout(()=>{
      const node = document.getElementById("justified-collage-container");
      toPng(node).then((dataUrl)=>{
        const link = document.createElement("a");
        link.download = "vision-board-collage.png";
        link.href = dataUrl;
        link.click();
      });
    }, 500);
  }

  return (
    <section className="min-h-screen bg-[#0F0F0F] text-white px-6 py-16 relative">
      {/* back */}
      <button
        onClick={goBack}
        className="absolute top-6 left-6 text-white text-2xl bg-black/40 p-2 rounded-full hover:bg-black/60"
      >
        ←
      </button>

      <h2 className="text-4xl text-[#f6e7d7] font-light mb-6 text-center">
        Your Vision Board
      </h2>

      <div className="flex items-center justify-center gap-6 mb-8">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="deviceSize"
            value="phone"
            checked={deviceSize==="phone"}
            onChange={()=> setDeviceSize("phone")}
          />
          <span className="text-sm">Phone (720×1280)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="deviceSize"
            value="laptop"
            checked={deviceSize==="laptop"}
            onChange={()=> setDeviceSize("laptop")}
          />
          <span className="text-sm">Laptop (1920×1080)</span>
        </label>
      </div>

      <div id="justified-collage-container">
        <JustifiedCollage
          images={selectedImages}
          containerWidth={containerWidth}
          targetRowHeight={250}
          rowSpacing={2}
        />
      </div>

      <div className="text-center mt-8">
        <button
          onClick={handleDownloadCollage}
          className="px-6 py-2 bg-gradient-to-r from-[#C8B560] to-[#FDE8B3] text-black rounded font-semibold hover:opacity-90"
        >
          Download Collage
        </button>
      </div>
    </section>
  );
}

/** 
 * JustifiedCollage:
 * leftover sticker approach
 */
function JustifiedCollage({ images, containerWidth, targetRowHeight=250, rowSpacing=2 }) {
  const [photoData, setPhotoData] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(()=>{
    let isMounted=true;
    async function loadRatios(){
      const arr=[];
      for(const url of images) {
        const r= await getImageRatio(url);
        arr.push({ url, ratio:r });
      }
      if(isMounted){
        setPhotoData(arr);
        setLoaded(true);
      }
    }
    loadRatios();
    return ()=>{ isMounted=false; };
  }, [images]);

  if(!loaded){
    return <p className="text-center text-[#ccc] italic">Loading collage data...</p>;
  }

  const rows = buildJustifiedRowsWithSticker(photoData, containerWidth, targetRowHeight);

  return (
    <div style={{ width: containerWidth, margin:"0 auto" }}>
      {rows.map((row, idx)=> (
        <div
          key={idx}
          style={{
            display:"flex",
            flexDirection:"row",
            marginBottom: idx<rows.length-1 ? rowSpacing :0
          }}
        >
          {row.map((item, i)=> {
            if(item.type==="photo") {
              return (
                <div key={i}
                  style={{
                    width: item.finalWidth+"px",
                    height: item.finalHeight+"px",
                    overflow:"hidden"
                  }}
                >
                  <img
                    src={item.url}
                    alt=""
                    style={{ width:"100%", height:"100%", objectFit:"cover" }}
                  />
                </div>
              );
            } else if(item.type==="sticker") {
              return (
                <div
                  key={i}
                  style={{
                    width: item.finalWidth+"px",
                    height: item.finalHeight+"px",
                    position:"relative",
                    backgroundColor:"#0F0F0F"
                  }}
                >
                  {/* post-it ~120x120 ortalanmis, hafif rotate */}
                  <div
                    style={{
                      width:"120px", height:"120px",
                      position:"absolute",
                      left: (item.finalWidth-120)/2+"px",
                      top: (item.finalHeight-120)/2+"px",
                      background:"linear-gradient(to bottom right, #FFFAD5, #FDE8B3)",
                      border:"3px solid #C8B560",
                      borderRadius:"10px",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      transform:"rotate(-5deg)",
                      boxShadow:"2px 2px 6px rgba(0,0,0,0.3)"
                    }}
                  >
                    <p
                      style={{
                        margin:0,
                        fontSize:"16px",
                        color:"#000",
                        fontFamily:"'Dancing Script', cursive",
                        textAlign:"center",
                        padding:"5px"
                      }}
                    >
                      You got this!
                    </p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
}

/** 
 * buildJustifiedRowsWithSticker:
 * leftoverSpace > 140 => add sticker
 */
function buildJustifiedRowsWithSticker(photoData, containerWidth, targetRowHeight) {
  const rows = [];
  let currentRow = [];
  let currentRowWidth = 0;

  for(let i=0; i<photoData.length; i++){
    const { url, ratio } = photoData[i];
    const scaledW = ratio * targetRowHeight;
    const newW = currentRowWidth + scaledW;

    if(newW > containerWidth && currentRow.length>0) {
      scaleRow(currentRow, currentRowWidth, containerWidth);
      rows.push(currentRow);
      currentRow = [{
        type:"photo",
        url,
        ratio,
        finalWidth: scaledW,
        finalHeight: targetRowHeight
      }];
      currentRowWidth = scaledW;
    } else {
      currentRow.push({
        type:"photo",
        url,
        ratio,
        finalWidth: scaledW,
        finalHeight: targetRowHeight
      });
      currentRowWidth = newW;
    }
  }

  // leftover row
  if(currentRow.length>0){
    const leftoverSpace = containerWidth - currentRowWidth;
    if(leftoverSpace>140) {
      currentRow.push({
        type:"sticker",
        finalWidth: leftoverSpace,
        finalHeight: targetRowHeight
      });
    }
    rows.push(currentRow);
  }
  return rows;
}

function scaleRow(row, rowWidth, containerWidth) {
  const ratio = containerWidth / rowWidth;
  row.forEach(it=>{
    it.finalWidth *= ratio;
    it.finalHeight *= ratio;
  });
}

/** getImageRatio -> w/h */
function getImageRatio(url) {
  return new Promise((resolve)=>{
    const img = new Image();
    img.onload= ()=>{
      const r = img.naturalWidth / img.naturalHeight;
      resolve(r);
    };
    img.src=url;
  });
}
