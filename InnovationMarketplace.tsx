import React, { useState } from 'react';

const InnovationUpload = () => {
  const [form, setForm] = useState({
    name: '',
    category: 'material',
    subcategory: '',
    price: '',
    unit: '',
    description: '',
    existingAlternative: '',
    comparisonPoints: '',
    sustainabilityScore: '',
    efficiency: '',
    manufacturer: '',
    contactEmail: '',
    website: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [catalog, setCatalog] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      const previews = files.map(f => URL.createObjectURL(f));
      setImagePreviews(previews);
    }
  };

  const handleCatalogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCatalog(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Convert images to base64 (mock – in real app upload to server)
    const imageBase64 = await Promise.all(images.map(img => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(img);
      });
    }));
    
    let catalogBase64 = '';
    if (catalog) {
      catalogBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(catalog);
      });
    }
    
    const newProduct = {
      id: Date.now(),
      ...form,
      price: parseFloat(form.price),
      sustainabilityScore: parseFloat(form.sustainabilityScore) || 0,
      images: imageBase64,
      catalogUrl: catalogBase64 ? `data:application/pdf;base64,${catalogBase64.split(',')[1]}` : '#',
      approved: false, // wait for admin approval
      createdAt: new Date().toISOString(),
    };
    
    // Save to localStorage (mock persistence)
    const existing = JSON.parse(localStorage.getItem('innovations') || '[]');
    existing.push(newProduct);
    localStorage.setItem('innovations', JSON.stringify(existing));
    
    setMessage('Product submitted for admin approval!');
    setSubmitting(false);
    // Reset form
    setForm({
      name: '', category: 'material', subcategory: '', price: '', unit: '', description: '',
      existingAlternative: '', comparisonPoints: '', sustainabilityScore: '', efficiency: '',
      manufacturer: '', contactEmail: '', website: '',
    });
    setImages([]);
    setCatalog(null);
    setImagePreviews([]);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">📢 Introduce New Material / Technology / Tool</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block font-semibold">Product Name *</label><input type="text" name="name" required value={form.name} onChange={handleChange} className="w-full border rounded p-2" /></div>
          <div><label className="block font-semibold">Category *</label><select name="category" value={form.category} onChange={handleChange} className="w-full border rounded p-2"><option value="material">Material</option><option value="technology">Technology</option><option value="tool">Tool</option><option value="green">Green Product</option></select></div>
          <div><label className="block font-semibold">Subcategory</label><input type="text" name="subcategory" value={form.subcategory} onChange={handleChange} className="w-full border rounded p-2" placeholder="e.g., Concrete, Software" /></div>
          <div><label className="block font-semibold">Price (₹) *</label><input type="number" name="price" required value={form.price} onChange={handleChange} className="w-full border rounded p-2" /></div>
          <div><label className="block font-semibold">Unit</label><input type="text" name="unit" value={form.unit} onChange={handleChange} className="w-full border rounded p-2" placeholder="kg, sqft, license" /></div>
          <div><label className="block font-semibold">Existing Alternative (for comparison)</label><input type="text" name="existingAlternative" value={form.existingAlternative} onChange={handleChange} className="w-full border rounded p-2" /></div>
          <div><label className="block font-semibold">Comparison Points (advantages)</label><textarea name="comparisonPoints" rows={2} value={form.comparisonPoints} onChange={handleChange} className="w-full border rounded p-2" /></div>
          <div><label className="block font-semibold">Sustainability Score (1-10)</label><input type="number" step="0.1" name="sustainabilityScore" value={form.sustainabilityScore} onChange={handleChange} className="w-full border rounded p-2" /></div>
          <div><label className="block font-semibold">Efficiency / Performance</label><input type="text" name="efficiency" value={form.efficiency} onChange={handleChange} className="w-full border rounded p-2" /></div>
          <div><label className="block font-semibold">Manufacturer / Dealer</label><input type="text" name="manufacturer" value={form.manufacturer} onChange={handleChange} className="w-full border rounded p-2" /></div>
          <div><label className="block font-semibold">Contact Email</label><input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} className="w-full border rounded p-2" /></div>
          <div><label className="block font-semibold">Website</label><input type="url" name="website" value={form.website} onChange={handleChange} className="w-full border rounded p-2" /></div>
        </div>
        <div><label className="block font-semibold">Description *</label><textarea name="description" rows={3} required value={form.description} onChange={handleChange} className="w-full border rounded p-2" /></div>
        <div><label className="block font-semibold">Upload Images (max 5)</label><input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full" /></div>
        {imagePreviews.length > 0 && <div className="flex gap-2 flex-wrap">{imagePreviews.map((src,i)=><img key={i} src={src} alt="preview" className="w-20 h-20 object-cover rounded" />)}</div>}
        <div><label className="block font-semibold">Upload Catalog (PDF)</label><input type="file" accept=".pdf" onChange={handleCatalogChange} className="w-full" /></div>
        <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">{submitting ? 'Submitting...' : 'Submit for Approval'}</button>
        {message && <p className="text-green-600">{message}</p>}
      </form>
    </div>
  );
};

export default InnovationUpload;