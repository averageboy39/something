import { useState, useEffect, useRef } from "react";
import { Heart, Star, Sparkles, Send, ChevronDown, Mail, Music, Camera, MessageSquare } from "lucide-react";
import * as THREE from "three";
import emailjs from '@emailjs/browser';

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [message, setMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [nameAnimation, setNameAnimation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const threeContainerRef = useRef(null);
  const audioRef = useRef(null);
  const sections = ["intro", "message", "gallery", "interactive"];
  
  // EmailJS configuration (replace with your actual credentials)
  const serviceId = 'service_xgfkm5n';
  const templateId = 'template_dbot1pn';
  const publicKey = 'DwpY5bPOZv4a0K16J';

  // Loading screen effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      startNameAnimation();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  // Name animation sequence
  const startNameAnimation = () => {
    setNameAnimation(true);
    setTimeout(() => {
      setNameAnimation(false);
    }, 4000);
  };

  // Three.js floating elements
  useEffect(() => {
    if (!loading && threeContainerRef.current) {
      // Set up scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      
      renderer.setSize(threeContainerRef.current.clientWidth, threeContainerRef.current.clientHeight);
      renderer.setClearColor(0x000000, 0);
      threeContainerRef.current.appendChild(renderer.domElement);
      
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      // Add point light
      const pointLight = new THREE.PointLight(0xff9daa, 1);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
      
      // Create heart geometry
      const heartShape = new THREE.Shape();
      heartShape.moveTo(0, 0);
      heartShape.bezierCurveTo(0, -1, -2, -2, -4, 0);
      heartShape.bezierCurveTo(-6, 2, -6, 4, -4, 6);
      heartShape.bezierCurveTo(-2, 8, 0, 8, 0, 6);
      heartShape.bezierCurveTo(0, 8, 2, 8, 4, 6);
      heartShape.bezierCurveTo(6, 4, 6, 2, 4, 0);
      heartShape.bezierCurveTo(2, -2, 0, -1, 0, 0);
      
      const extrudeSettings = {
        depth: 1,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.5,
        bevelThickness: 0.5
      };
      
      const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      
      // Create star geometry
      const starShape = new THREE.Shape();
      const spikes = 5;
      const outerRadius = 0.8;
      const innerRadius = 0.4;
      
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        if (i === 0) {
          starShape.moveTo(x, y);
        } else {
          starShape.lineTo(x, y);
        }
      }
      starShape.closePath();
      
      const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
      
      // Create floating elements
      const elements = [];
      const heartColors = [0xff9daa, 0xff6b8e, 0xff477e, 0xffcad4];
      const starColors = [0xffd700, 0xfff700, 0xffff9d, 0xffffff];
      
      for (let i = 0; i < 25; i++) {
        const isHeart = Math.random() > 0.3;
        const geometry = isHeart ? heartGeometry : starGeometry;
        const colors = isHeart ? heartColors : starColors;
        
        const material = new THREE.MeshPhongMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          shininess: 100,
          specular: 0xffffff
        });
        
        const element = new THREE.Mesh(geometry, material);
        
        // Scale and position
        const scale = Math.random() * 0.06 + 0.02;
        element.scale.set(scale, scale, scale);
        
        element.position.x = (Math.random() - 0.5) * 30;
        element.position.y = (Math.random() - 0.5) * 30;
        element.position.z = (Math.random() - 0.5) * 30 - 15;
        
        // Random rotation
        element.rotation.x = Math.random() * Math.PI;
        element.rotation.y = Math.random() * Math.PI;
        element.rotation.z = Math.random() * Math.PI;
        
        // Add to scene and array
        scene.add(element);
        elements.push({
          mesh: element,
          rotationSpeed: {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
          },
          movementSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
          }
        });
      }
      
      // Add floating text particles
      const loader = new THREE.TextureLoader();
      const textParticles = [];
      
      const createTextParticle = (text, color) => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'Bold 40px Arial';
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        
        sprite.scale.set(2, 1, 1);
        sprite.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40 - 20
        );
        
        scene.add(sprite);
        textParticles.push({
          sprite,
          movementSpeed: {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
          }
        });
      };
      
      // Create floating words
      ['Pratiksha', 'Special', 'Beautiful', 'Amazing', 'Thoughtful','Understandable'].forEach(word => {
        createTextParticle(word, `hsl(${Math.random() * 60 + 300}, 100%, 70%)`);
      });
      
      // Position camera
      camera.position.z = 25;
      
      // Animation
      const animate = () => {
        requestAnimationFrame(animate);
        
        elements.forEach(element => {
          element.mesh.rotation.x += element.rotationSpeed.x;
          element.mesh.rotation.y += element.rotationSpeed.y;
          element.mesh.rotation.z += element.rotationSpeed.z;
          
          element.mesh.position.x += element.movementSpeed.x;
          element.mesh.position.y += element.movementSpeed.y;
          element.mesh.position.z += element.movementSpeed.z;
          
          // Boundaries check
          if (Math.abs(element.mesh.position.x) > 25) element.movementSpeed.x *= -1;
          if (Math.abs(element.mesh.position.y) > 25) element.movementSpeed.y *= -1;
          if (Math.abs(element.mesh.position.z + 15) > 25) element.movementSpeed.z *= -1;
        });
        
        // Animate text particles
        textParticles.forEach(particle => {
          particle.sprite.position.x += particle.movementSpeed.x;
          particle.sprite.position.y += particle.movementSpeed.y;
          particle.sprite.position.z += particle.movementSpeed.z;
          
          if (Math.abs(particle.sprite.position.x) > 30) particle.movementSpeed.x *= -1;
          if (Math.abs(particle.sprite.position.y) > 30) particle.movementSpeed.y *= -1;
          if (Math.abs(particle.sprite.position.z + 20) > 30) particle.movementSpeed.z *= -1;
        });
        
        // Slow camera rotation
        camera.position.x = Math.sin(Date.now() * 0.0002) * 5;
        camera.position.y = Math.cos(Date.now() * 0.0003) * 3;
        camera.lookAt(scene.position);
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Handle window resize
      const handleResize = () => {
        if (threeContainerRef.current) {
          camera.aspect = threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(threeContainerRef.current.clientWidth, threeContainerRef.current.clientHeight);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (threeContainerRef.current && renderer.domElement) {
          threeContainerRef.current.removeChild(renderer.domElement);
        }
      };
    }
  }, [loading]);
  
  // Trigger confetti animation
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };
  
  // Trigger floating hearts animation
  const triggerHearts = () => {
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 3000);
  };
  
  // Trigger floating stars animation
  const triggerStars = () => {
    setShowStars(true);
    setTimeout(() => setShowStars(false), 3000);
  };
  
  // Toggle background music
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle scroll to next section
  const scrollToNextSection = () => {
    const nextSection = (currentSection + 1) % sections.length;
    setCurrentSection(nextSection);
    document.getElementById(sections[nextSection]).scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim()) {
      // Send email using EmailJS
      emailjs.send(serviceId, templateId, {
        message: message,
        from_name: "Pratiksha's Special Page",
        to_name: "You"
      }, publicKey)
      .then((response) => {
        console.log('Email sent successfully!', response.status, response.text);
        triggerHearts();
        triggerStars();
        setMessage("");
        setFormSubmitted(true);
        setTimeout(() => setFormSubmitted(false), 5000);
      }, (error) => {
        console.log('Failed to send email:', error);
        alert("Failed to send message. Please try again later.");
      });
    }
  };
  
  // Floating Hearts Animation Component
  const FloatingHearts = () => {
    if (!showHearts) return null;
    
    const hearts = Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 25 + 15;
      const startPosition = Math.random() * 80 + 10;
      const duration = Math.random() * 4 + 3;
      const delay = Math.random() * 3;
      const colors = ['text-pink-400', 'text-red-400', 'text-purple-400', 'text-rose-400'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return (
        <div 
          key={i}
          className={`absolute opacity-80 ${color}`}
          style={{
            left: `${startPosition}%`,
            bottom: '0',
            animation: `floatUp ${duration}s ease-in-out ${delay}s forwards`,
            fontSize: `${size}px`,
          }}
        >
          <Heart fill="currentColor" />
        </div>
      );
    });
    
    return <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">{hearts}</div>;
  };
  
  // Floating Stars Animation Component
  const FloatingStars = () => {
    if (!showStars) return null;
    
    const stars = Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 25 + 15;
      const startPosition = Math.random() * 80 + 10;
      const duration = Math.random() * 4 + 3;
      const delay = Math.random() * 3;
      const colors = ['text-yellow-300', 'text-amber-300', 'text-white', 'text-blue-300'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return (
        <div 
          key={i}
          className={`absolute opacity-80 ${color}`}
          style={{
            left: `${startPosition}%`,
            bottom: '0',
            animation: `floatUp ${duration}s ease-in-out ${delay}s forwards`,
            fontSize: `${size}px`,
          }}
        >
          <Star fill="currentColor" />
        </div>
      );
    });
    
    return <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">{stars}</div>;
  };
  
  // Confetti Component
  const Confetti = () => {
    if (!showConfetti) return null;
    
    const confettiPieces = Array.from({ length: 200 }).map((_, i) => {
      const size = Math.random() * 10 + 5;
      const startPosition = Math.random() * 100;
      const duration = Math.random() * 5 + 3;
      const delay = Math.random() * 5;
      const rotation = Math.random() * 360;
      const shapes = ['rounded-sm', 'rounded-full'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const colors = ['bg-pink-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return (
        <div 
          key={i}
          className={`absolute ${color} ${shape}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${startPosition}%`,
            top: '-5%',
            transform: `rotate(${rotation}deg)`,
            animation: `confettiFall ${duration}s ease-in-out ${delay}s forwards`,
          }}
        />
      );
    });
    
    return <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">{confettiPieces}</div>;
  };

  // Loading screen
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-pink-900 flex flex-col items-center justify-center text-white z-50">
        <div className="text-4xl mb-6 animate-pulse flex items-center">
          <Sparkles className="mr-3" size={32} />
          Creating something special...
          <Sparkles className="ml-3" size={32} />
        </div>
        <div className="relative w-64 h-6 bg-gray-800 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-loading-bar"></div>
        </div>
        <div className="mt-4 text-pink-300 flex items-center">
          <Heart className="mr-2" size={20} fill="currentColor" />
          For Pratiksha
          <Heart className="ml-2" size={20} fill="currentColor" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 min-h-screen text-white overflow-x-hidden">
      {/* Background Music */}
      <audio 
        ref={audioRef} 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
        loop 
      />
      
      {/* Three.js Background Container */}
      <div ref={threeContainerRef} className="fixed inset-0 z-0" />
      
      {/* Floating Animations */}
      <FloatingHearts />
      <FloatingStars />
      <Confetti />
      
      {/* Music Control */}
      <button 
        onClick={toggleMusic}
        className="fixed top-4 right-4 z-50 p-3 bg-pink-600/70 rounded-full hover:bg-pink-600 transition-colors shadow-lg"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        <Music size={24} fill={isPlaying ? "white" : "none"} />
      </button>
      
      {/* Intro Section */}
      <section id="intro" className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4">
        <div className="relative">
          <h1 className={`text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 mb-6 transition-all duration-1000 ${nameAnimation ? 'animate-name-reveal' : ''}`}>
            Pratiksha
          </h1>
          <div className="absolute -top-16 -right-16 text-pink-300 animate-float hidden md:block">
            <Sparkles size={64} />
          </div>
          <div className="absolute -bottom-12 -left-12 text-pink-300 animate-float-delayed hidden md:block">
            <Star size={48} fill="currentColor" />
          </div>
        </div>
        
        <p className="text-xl md:text-2xl text-pink-200 max-w-lg text-center mb-12 animate-fade-in">
          A special place for someone special, who brings light to my days with just a simple message.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={triggerConfetti}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold shadow-glow hover:shadow-glow-intense transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <Sparkles className="mr-2" size={20} /> Magic ✨
          </button>
          <button 
            onClick={() => {
              triggerHearts();
              triggerStars();
            }}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full font-bold shadow-glow hover:shadow-glow-intense transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <Heart className="mr-2" size={20} fill="white" /> Love ❤️
          </button>
        </div>
        
        <div className="absolute bottom-10 animate-bounce cursor-pointer" onClick={scrollToNextSection}>
          <ChevronDown size={32} />
        </div>
      </section>
      
      {/* Message Section */}
      <section id="message" className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center animate-fade-in-delayed">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
            Every Convo with you is special
          </span>
        </h2>
        
        <div className="backdrop-blur-md bg-white/10 p-8 rounded-xl shadow-lg max-w-2xl w-full border border-pink-300/30 mb-8 animate-fade-in relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 text-pink-400/20">
            <Heart size={120} />
          </div>
          <div className="absolute -bottom-8 -left-8 text-purple-400/20">
            <Star size={100} />
          </div>
          
          <p className="text-xl leading-relaxed relative z-10">
            Dear Pratiksha,
          </p>
          <p className="mt-4 text-lg leading-relaxed relative z-10">
            From the moment we started talking, something has felt different—special. The way you express yourself, 
            the thoughts you share, even the simplest conversations have left an impression on me that I can't shake.
          </p>
          <p className="mt-4 text-lg leading-relaxed relative z-10">
            I created this little digital space just for you. A small gesture to show you that you're thought of, 
            appreciated, and that our conversations—even if just online for now—mean more to me than you might realize.
          </p>
          <p className="mt-4 text-lg leading-relaxed relative z-10">
            I hope this brings a smile to your face, because your smile (even if I've only imagined it) brightens my world.
          </p>
          <p className="mt-6 text-right text-pink-300 relative z-10">With warmth,</p>
        </div>
        
        <div className="animate-fade-in-delayed mt-6 flex flex-wrap justify-center gap-4">
          <button 
            onClick={triggerHearts}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold shadow-glow hover:shadow-glow-intense transform hover:scale-105 transition-all duration-300 flex items-center"
          >
            <Heart size={20} className="mr-2" fill="white" /> Hearts
          </button>
          <button 
            onClick={triggerStars}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full font-bold shadow-glow hover:shadow-glow-intense transform hover:scale-105 transition-all duration-300 flex items-center"
          >
            <Star size={20} className="mr-2" fill="white" /> Stars
          </button>
          <button 
            onClick={triggerConfetti}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full font-bold shadow-glow hover:shadow-glow-intense transform hover:scale-105 transition-all duration-300 flex items-center"
          >
            <Sparkles size={20} className="mr-2" /> Confetti
          </button>
        </div>
        
        <div className="absolute bottom-10 animate-bounce cursor-pointer" onClick={scrollToNextSection}>
          <ChevronDown size={32} />
        </div>
      </section>
      
      {/* Gallery Section */}
      <section id="gallery" className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center animate-fade-in">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
            What Makes You Special
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          {[
            { title: "Your Kindness", icon: <Sparkles size={32} />, desc: "The way you express yourself with such genuine warmth.", color: "from-pink-500 to-rose-500" },
            { title: "Your Thoughts", icon: <MessageSquare size={32} />, desc: "How you think deeply about things that matter.", color: "from-purple-500 to-indigo-500" },
            { title: "Your Smile", icon: "😊", desc: "Even through messages, I can feel your smile brightening my day.", color: "from-yellow-500 to-amber-500" },
            { title: "Your Habits", icon: <Star size={32} fill="currentColor" />, desc: "How just talking to you makes ordinary moments extraordinary.", color: "from-blue-500 to-cyan-500" },
            { title: "Your way of Treating", icon: <Camera size={32} />, desc: "The unique way you see and interpret the world around you.", color: "from-green-500 to-teal-500" },
            { title: "Your Heart", icon: <Heart size={32} fill="currentColor" />, desc: "The kindness and warmth you share with those around you.", color: "from-red-500 to-pink-500" }
          ].map((item, index) => (
            <div 
              key={index}
              className={`backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in hover:shadow-glow-intense ${item.color ? `hover:bg-gradient-to-br ${item.color}` : ''}`}
              style={{ animationDelay: `${0.2 * index}s` }}
            >
              <div className="text-4xl mb-4 flex justify-center">
                {typeof item.icon === 'string' ? (
                  <span>{item.icon}</span>
                ) : (
                  item.icon
                )}
              </div>
              <h3 className="text-xl font-bold mb-2 text-center text-pink-200">{item.title}</h3>
              <p className="text-gray-200 text-center">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-10 animate-bounce cursor-pointer" onClick={scrollToNextSection}>
          <ChevronDown size={32} />
        </div>
      </section>
      
      {/* Interactive Section */}
      <section id="interactive" className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10 pb-24">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center animate-fade-in">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
            Share Your Thoughts
          </span>
        </h2>
        
        <div className="backdrop-blur-md bg-white/10 p-8 rounded-xl shadow-lg max-w-2xl w-full border border-pink-300/30 animate-fade-in relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 text-pink-400/20">
            <Mail size={80} />
          </div>
          
          {formSubmitted ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">💖</div>
              <h3 className="text-2xl font-bold text-pink-200 mb-4">Message Sent with Love!</h3>
              <p className="text-lg">Your special message has been delivered straight to my heart.</p>
              <button 
                onClick={() => setFormSubmitted(false)}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold shadow-glow hover:shadow-glow-intense transform hover:scale-105 transition-all duration-300"
              >
                Send Another
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-pink-200 mb-2 text-lg">Write something special:</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 rounded-lg bg-purple-900/50 border border-pink-300/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none h-32"
                  placeholder="What's on your mind?"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                  className={`px-6 py-2 rounded-full font-bold flex items-center ${!message.trim() ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-glow transform hover:scale-105'} transition-all duration-300`}
                >
                  Send to Me <Send size={18} className="ml-2" />
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-16 text-center max-w-lg animate-fade-in-delayed">
          <p className="text-xl text-pink-200">
            This page was created with you in mind, Pratiksha. Every animation, every word, every color was chosen to make you smile.
          </p>
          <div className="mt-8 flex justify-center gap-6 flex-wrap">
            <button 
              onClick={triggerConfetti}
              className="p-3 bg-pink-500/70 rounded-full hover:bg-pink-500 transition-colors shadow-lg flex items-center justify-center"
            >
              <Sparkles size={24} />
            </button>
            <button 
              onClick={triggerHearts}
              className="p-3 bg-pink-500/70 rounded-full hover:bg-pink-500 transition-colors shadow-lg flex items-center justify-center"
            >
              <Heart size={24} fill="white" />
            </button>
            <button 
              onClick={triggerStars}
              className="p-3 bg-pink-500/70 rounded-full hover:bg-pink-500 transition-colors shadow-lg flex items-center justify-center"
            >
              <Star size={24} fill="white" />
            </button>
            <button 
              onClick={toggleMusic}
              className="p-3 bg-pink-500/70 rounded-full hover:bg-pink-500 transition-colors shadow-lg flex items-center justify-center"
            >
              <Music size={24} fill={isPlaying ? "white" : "none"} />
            </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-pink-300/80 backdrop-blur-sm bg-black/30 z-20 flex justify-between items-center">
        <div className="flex items-center">
          <Heart size={16} className="mr-1" fill="currentColor" />
          <span>Pratiksha</span>
        </div>
        <div className="flex items-center">
          <span>Created with Love</span>
          <Heart size={16} className="ml-1" fill="currentColor" />
        </div>
      </footer>
      
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes confettiFall {
          0% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 1; 
          }
          80% {
            opacity: 1;
          }
          100% { 
            transform: translateY(100vh) rotate(720deg); 
            opacity: 0; 
          }
        }
        
        @keyframes floatUp {
          0% { 
            transform: translateY(0) scale(1); 
            opacity: 0.8; 
          }
          80% {
            opacity: 0.6;
          }
          100% { 
            transform: translateY(-100vh) scale(0); 
            opacity: 0; 
          }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes name-reveal {
          0% { letter-spacing: normal; opacity: 1; }
          50% { letter-spacing: 20px; opacity: 0.7; }
          100% { letter-spacing: normal; opacity: 1; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(236, 72, 153, 0.5); }
          50% { box-shadow: 0 0 25px rgba(236, 72, 153, 0.8); }
        }
        
        .animate-loading-bar {
          animation: loading-bar 3s linear forwards;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite 1s;
        }
        
        .animate-fade-in {
          opacity: 0;
          animation: fade-in 1s ease-out forwards;
        }
        
        .animate-fade-in-delayed {
          opacity: 0;
          animation: fade-in 1s ease-out 0.5s forwards;
        }
        
        .animate-name-reveal {
          animation: name-reveal 4s ease-in-out;
        }
        
        .shadow-glow {
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.5);
        }
        
        .shadow-glow-intense {
          box-shadow: 0 0 25px rgba(236, 72, 153, 0.8);
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}