import { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { endpoints } from "@/lib/api";

type Props = { product?: any; onSuccess?: (p: any) => void; onCancel?: () => void };

export default function AddProductForm({ product, onSuccess, onCancel }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Avakaya Pickle");
  const [price, setPrice] = useState(0);
  const [mrp, setMrp] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [stock, setStock] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategory(product.category || "Avakaya Pickle");
      setPrice(product.price || 0);
      setMrp(product.mrp || 0);
      setDescription(product.description || "");
      setImage(product.image || "");
      setImageFile(null);
      setStock(product.stock || 0);
      return;
    }

    setName("");
    setCategory("Avakaya Pickle");
    setPrice(0);
    setMrp(0);
    setDescription("");
    setImage("");
    setImageFile(null);
    setStock(0);
  }, [product]);

  const isEdit = Boolean(product?._id);
  const save = useMutation({
    mutationFn: (data: any) =>
      isEdit ? endpoints.products.update(product._id, data) : endpoints.products.create(data),
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data?.product || null);
    }
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: any) => {
    e.preventDefault();
    await save.mutateAsync({ name, category, price: Number(price), mrp: Number(mrp), description, image, stock: Number(stock) });
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className="flex-1 rounded border border-border bg-card px-3 py-2" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded border border-border bg-card px-3 py-2">
          {[
            "Avakaya Pickle",
            "Gongura Pickle",
            "Lemon Pickle",
            "Garlic Pickle",
            "Mango Pickle",
            "Chicken Pickle",
            "Mutton Pickle",
            "Fish Pickle",
            "Prawn Pickle",
            "kakarkaya Pickle",
          ].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input required type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Price" className="w-32 rounded border border-border bg-card px-3 py-2" />
        <input type="number" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} placeholder="MRP" className="w-32 rounded border border-border bg-card px-3 py-2" />
        <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} placeholder="Stock" className="w-32 rounded border border-border bg-card px-3 py-2" />
      </div>

      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center rounded border-2 border-dashed border-border bg-card px-3 py-4 hover:border-primary cursor-pointer transition"
        >
          <span className="text-sm text-muted-foreground">
            {imageFile ? `📷 ${imageFile.name}` : "📁 Click to upload image"}
          </span>
        </button>
        {imageFile && (
          <div className="mt-2 text-sm text-green-600">✓ Image selected: {imageFile.name}</div>
        )}
      </div>

      <div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="w-full rounded border border-border bg-card px-3 py-2" rows={4} />
      </div>

      {image && (
        <div className="mt-3">
          <div className="text-sm text-muted-foreground">Image preview</div>
          <img src={image} alt="Product preview" className="mt-2 h-32 w-full rounded object-cover border border-border bg-card" />
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded border border-border px-4 py-2">Cancel</button>
        <button disabled={save.isLoading} type="submit" className="btn-gold">{save.isLoading ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Product')}</button>
      </div>
    </form>
  );
}
