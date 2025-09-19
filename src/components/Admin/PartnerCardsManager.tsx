import { usePartnerCards } from '@/hooks/usePartnerCards';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import Button from '../common/Button/Button';
import Loader from '../Loader/Loader';

export default function PartnerCardsManager() {
  const {
    cards,
    loading,
    error,
    uploadLogo,
    createCard,
    updateCard,
    deleteCard,
  } = usePartnerCards();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link: '',
    gradient_color_1: '#34D399',
    gradient_color_2: '#F98635',
    bg_color: 'bg-secondary/[0.99]',
    is_active: true,
    display_order: 0,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset color combinations from existing partners
  const COLOR_PRESETS = [
    { name: 'Carrot', color1: '#34D399', color2: '#F98635' },
    { name: 'Kamino', color1: '#2b5dff', color2: '#001763' },
    { name: 'Loopscale', color1: '#c9c8ff', color2: '#0075ff' },
    { name: 'Exponent', color1: '#001b03', color2: '#00ee1a' },
    { name: 'Meteora A', color1: '#ff7800', color2: '#5601d1' },
    { name: 'Meteora B', color1: '#5601d1', color2: '#ff7800' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (
      !logoFile ||
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.link.trim()
    ) {
      return;
    }

    setUploading(true);
    try {
      // Upload logo to Vercel Blob
      const logoUrl = await uploadLogo(logoFile);

      // Create partner card
      await createCard({
        ...formData,
        logo_blob_url: logoUrl,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        link: '',
        gradient_color_1: '#34D399',
        gradient_color_2: '#F98635',
        bg_color: 'bg-secondary/[0.99]',
        is_active: true,
        display_order: 0,
      });
      setLogoFile(null);
      setLogoPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error creating partner card:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCard(id);
    } catch (error) {
      console.error('Error deleting partner card:', error);
    }
  };

  const handlePresetSelect = (preset: { color1: string; color2: string }) => {
    setFormData({
      ...formData,
      gradient_color_1: preset.color1,
      gradient_color_2: preset.color2,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 mt-8 border rounded-xl">
      <h1 className="text-lg font-interSemibold mb-3 capitalize">
        Create New Partner Card
      </h1>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : null}

      {/* Create Form */}
      <div className="mb-8">
        {/* Logo Upload */}
        <div className="mb-4">
          <p className="font-interSemibold mb-2 text-sm">Logo</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="text-sm p-3 rounded-xl font-boldy outline-none w-full bg-inputcolor border border-white/10"
          />
          {logoPreview && (
            <div className="mt-2 p-2 border rounded-lg bg-third">
              <Image
                src={logoPreview}
                alt="Logo preview"
                width={80}
                height={32}
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* Partner Name */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Partner name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="text-sm p-3 rounded-xl font-boldy outline-none w-full bg-inputcolor border border-white/10"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Description (e.g., 'Boost your ALP with leverage loop')"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="text-sm p-3 rounded-xl font-boldy outline-none w-full bg-inputcolor border border-white/10"
          />
        </div>

        {/* Link */}
        <div className="mb-4">
          <input
            type="url"
            placeholder="Partner link (https://...)"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className="text-sm p-3 rounded-xl font-boldy outline-none w-full bg-inputcolor border border-white/10"
          />
        </div>

        {/* Color Presets */}
        <div className="mb-4">
          <p className="font-interSemibold mb-2 text-sm">Color Presets</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {COLOR_PRESETS.map((preset, index) => (
              <div
                key={index}
                onClick={() => handlePresetSelect(preset)}
                className={`cursor-pointer border-2 rounded-lg p-2 transition-all duration-200 ${
                  formData.gradient_color_1 === preset.color1 &&
                  formData.gradient_color_2 === preset.color2
                    ? 'border-white'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <div
                  className="relative p-[1px] rounded-lg block bg-[length:250%_100%] animate-text-shimmer"
                  style={{
                    background: `linear-gradient(110deg, ${preset.color1}, ${preset.color2}, ${preset.color1})`,
                  }}
                >
                  <div className="flex items-center justify-center py-2 px-3 rounded-lg bg-secondary/[0.99]">
                    <span className="text-xs text-white font-interMedium">
                      {preset.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <div className="mb-4">
          <p className="font-interSemibold mb-2 text-sm">Custom Colors</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-interMedium">Color 1:</span>
              <input
                type="color"
                value={formData.gradient_color_1}
                onChange={(e) =>
                  setFormData({ ...formData, gradient_color_1: e.target.value })
                }
                className="w-10 h-8 border rounded border-white/20 bg-transparent cursor-pointer"
              />
              <span className="text-xs font-mono text-white/60">
                {formData.gradient_color_1}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-interMedium">Color 2:</span>
              <input
                type="color"
                value={formData.gradient_color_2}
                onChange={(e) =>
                  setFormData({ ...formData, gradient_color_2: e.target.value })
                }
                className="w-10 h-8 border rounded border-white/20 bg-transparent cursor-pointer"
              />
              <span className="text-xs font-mono text-white/60">
                {formData.gradient_color_2}
              </span>
            </div>
          </div>
        </div>

        {/* Live Preview - Exact ALP Page Style */}
        {(formData.name || formData.description || logoPreview) && (
          <div className="mb-4">
            <p className="font-interSemibold mb-2 text-sm">Live Preview</p>
            <div
              className="relative p-[1px] rounded-xl block animate-text-shimmer bg-[length:250%_100%]"
              style={{
                background: `linear-gradient(110deg, ${formData.gradient_color_1}, ${formData.gradient_color_2}, ${formData.gradient_color_1})`,
              }}
            >
              <div className="flex flex-row items-center justify-between pt-3 pb-3 pl-5 pr-5 rounded-xl relative z-10 hover:opacity-90 transition-opacity duration-300 min-h-[2.75rem] max-h-[2.75rem] bg-secondary/[0.99]">
                <div className="flex-1">
                  <p className="text-sm text-white">
                    {formData.description || 'Description preview'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  |
                  {logoPreview && (
                    <Image
                      src={logoPreview}
                      alt="Preview"
                      width={20}
                      height={20}
                      className="w-[5rem] h-auto object-contain"
                    />
                  )}
                  <Image
                    src="/images/Icons/arrow-sm-45.svg"
                    alt="External link"
                    width={6}
                    height={6}
                    className="w-3 h-3"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          title={uploading ? 'Creating...' : 'Create'}
          onClick={handleCreate}
          disabled={
            !logoFile ||
            !formData.name.trim() ||
            !formData.description.trim() ||
            !formData.link.trim() ||
            uploading
          }
          className="px-6 py-2"
        />
      </div>

      {/* Existing Cards */}
      <div>
        <h3 className="text-base font-interSemibold mb-2 capitalize">
          Existing Partner Cards
        </h3>

        {loading && cards.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        ) : cards.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm opacity-50">No partner cards found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="border rounded-lg p-3 bg-third border-inputcolor"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Image
                        src={card.logo_blob_url}
                        alt={card.name}
                        width={60}
                        height={24}
                        className="object-contain"
                      />
                      <div>
                        <p className="text-base font-interMedium">
                          {card.name}
                        </p>
                        <p className="text-sm opacity-75">{card.description}</p>
                        <a
                          href={card.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {card.link}
                        </a>
                      </div>
                    </div>

                    {/* Exact ALP Page Preview */}
                    <div
                      className="relative p-[1px] rounded-xl block max-w-md animate-text-shimmer bg-[length:250%_100%]"
                      style={{
                        background: `linear-gradient(110deg, ${card.gradient_color_1}, ${card.gradient_color_2}, ${card.gradient_color_1})`,
                      }}
                    >
                      <div className="flex flex-row items-center justify-between pt-3 pb-3 pl-5 pr-5 rounded-xl relative z-10 hover:opacity-90 transition-opacity duration-300 min-h-[2.75rem] max-h-[2.75rem] bg-secondary/[0.99]">
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            {card.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          |
                          <Image
                            src={card.logo_blob_url}
                            alt={card.name}
                            width={20}
                            height={20}
                            className="w-[5rem] h-auto object-contain"
                          />
                          <Image
                            src="/images/Icons/arrow-sm-45.svg"
                            alt="External link"
                            width={6}
                            height={6}
                            className="w-3 h-3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-interMedium transition duration-300"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
