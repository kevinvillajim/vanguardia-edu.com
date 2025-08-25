import React, { useState } from 'react';
import { ZoomIn, X } from 'lucide-react';
import { MediaImage } from '../../../../../shared/components/media/MediaImage';
import { 
  EditorTabs, 
  FormField, 
  TextInput, 
  TextArea, 
  PreviewSection,
  SettingsSection,
  SelectField,
  CheckboxField,
  FileUploadSection,
  TabType 
} from '../shared';

interface ImageContent {
  title: string;
  img: string;
  alt?: string;
  caption?: string | null;
  description?: string | null;
  alignment?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large' | 'full';
}

interface ComponentData {
  id: string;
  type: string;
  title: string;
  content?: ImageContent;
  metadata?: any;
}

interface ImageEditorProps {
  component: ComponentData;
  onUpdate: (updates: Partial<ComponentData>) => void;
  moduleId: string;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  component,
  onUpdate,
  moduleId
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [imageFullscreen, setImageFullscreen] = useState(false);
  
  const content = component.content || {
    title: component.title,
    img: '',
    alt: '',
    caption: '',
    description: '',
    alignment: 'center' as const,
    size: 'medium' as const
  };

  const updateContent = (updates: Partial<ImageContent>) => {
    const newContent = { ...content, ...updates };
    onUpdate({ content: newContent });
  };

  const handleImageUpload = (fileUrl: string, metadata?: any) => {
    updateContent({ img: fileUrl });
  };

  const removeImage = () => {
    updateContent({ img: '' });
  };

  const getSizeClasses = () => {
    switch (content.size) {
      case 'small': return 'max-w-sm';
      case 'medium': return 'max-w-md';
      case 'large': return 'max-w-lg';
      case 'full': return 'w-full';
      default: return 'max-w-md';
    }
  };

  const getAlignmentClasses = () => {
    switch (content.alignment) {
      case 'left': return 'justify-start';
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      default: return 'justify-center';
    }
  };

  return (
		<div className="space-y-6">
			<EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{activeTab === "content" && (
				<div className="space-y-6">
					<FormField label="Título de la Imagen" required>
						<TextInput
							value={content.title}
							onChange={(value) => updateContent({title: value})}
							placeholder="Título de la imagen"
						/>
					</FormField>

					<FileUploadSection
						fileUrl={content.img}
						onUploadComplete={handleImageUpload}
						onRemoveFile={removeImage}
						fileType="image"
						label="Archivo de Imagen"
						required
						allowFullscreen
						onFullscreen={() => setImageFullscreen(true)}
					/>

					<FormField label="Texto Alternativo (Alt Text)">
						<TextInput
							value={content.alt || ""}
							onChange={(value) => updateContent({alt: value})}
							placeholder="Descripción breve de la imagen para accesibilidad"
						/>
						<p className="text-xs text-gray-500 mt-1">
							Importante para accesibilidad y SEO
						</p>
					</FormField>

					<FormField label="Leyenda (opcional)">
						<TextInput
							value={content.caption || ""}
							onChange={(value) => updateContent({caption: value})}
							placeholder="Leyenda que aparecerá debajo de la imagen"
						/>
					</FormField>

					<FormField label="Descripción (opcional)">
						<TextArea
							value={content.description || ""}
							onChange={(value) => updateContent({description: value})}
							rows={3}
							placeholder="Descripción adicional de la imagen..."
						/>
					</FormField>
				</div>
			)}

			{activeTab === "settings" && (
				<div className="space-y-6">
					<SettingsSection title="Tamaño de la Imagen">
						<FormField label="Tamaño">
							<SelectField
								value={content.size}
								onChange={(value) => updateContent({size: value as any})}
								options={[
									{value: "small", label: "Pequeña (~300px)"},
									{value: "medium", label: "Mediana (~500px)"},
									{value: "large", label: "Grande (~700px)"},
									{value: "full", label: "Ancho completo (100%)"},
								]}
							/>
						</FormField>
					</SettingsSection>

					<SettingsSection title="Alineación">
						<FormField label="Posición">
							<SelectField
								value={content.alignment}
								onChange={(value) => updateContent({alignment: value as any})}
								options={[
									{value: "left", label: "Izquierda"},
									{value: "center", label: "Centro"},
									{value: "right", label: "Derecha"},
								]}
							/>
						</FormField>
					</SettingsSection>

					{content.img && (
						<PreviewSection title="Vista previa del diseño">
							<div className={`flex ${getAlignmentClasses()}`}>
								<div className={getSizeClasses()}>
									<MediaImage
										src={content.img}
										alt={content.alt || content.title}
										className="w-full rounded-lg shadow-sm"
										fallbackStrategy="after-error"
									/>
									{content.caption && (
										<p className="text-sm text-gray-600 mt-2 text-center italic">
											{content.caption}
										</p>
									)}
								</div>
							</div>
						</PreviewSection>
					)}

					<PreviewSection title="Recomendaciones">
						<div className="space-y-2 text-xs text-gray-600">
							<div className="flex justify-between">
								<span>Formatos recomendados:</span>
								<span>JPG, PNG, WebP</span>
							</div>
							<div className="flex justify-between">
								<span>Resolución mínima:</span>
								<span>800x600px</span>
							</div>
							<div className="flex justify-between">
								<span>Tamaño máximo:</span>
								<span>10MB</span>
							</div>
							<div className="flex justify-between">
								<span>Ratio recomendado:</span>
								<span>16:9 o 4:3</span>
							</div>
						</div>
					</PreviewSection>
				</div>
			)}

			{/* Modal de imagen en pantalla completa */}
			{imageFullscreen && content.img && (
				<div
					className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
					onClick={() => setImageFullscreen(false)}
				>
					<div className="relative w-full h-full flex items-center justify-center p-4">
						<MediaImage
							src={content.img}
							alt={content.alt || content.title}
							className="max-w-[90vw] max-h-[90vh] object-contain"
							fallbackStrategy="after-error"
						/>
						<button
							onClick={(e) => {
								e.stopPropagation(); // evita que se cierre al hacer click en el botón
								setImageFullscreen(false);
							}}
							className="absolute top-4 right-4 p-2 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 transition-colors"
						>
							<X className="w-6 h-6" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
};