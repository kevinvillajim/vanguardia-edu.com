import React, { useState } from 'react';
import { Upload, Music, X, Play, Pause, Volume2 } from 'lucide-react';
import Button from '../../../../../components/ui/Button/Button';
import { FileUploader } from '../../FileUploader/FileUploader';
import { AudioPlayer } from '../../../../../shared/components/media/AudioPlayer';
import { 
  EditorTabs, 
  FormField, 
  TextInput, 
  TextArea, 
  PreviewSection,
  SettingsSection,
  CheckboxField,
  TabType 
} from '../shared';

interface AudioContent {
  title: string;
  src: string;
  description?: string | null;
  duration?: number | null;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
}

interface ComponentData {
  id: string;
  type: string;
  title: string;
  content?: AudioContent;
  metadata?: any;
}

interface AudioEditorProps {
  component: ComponentData;
  onUpdate: (updates: Partial<ComponentData>) => void;
  moduleId: string;
}

export const AudioEditor: React.FC<AudioEditorProps> = ({
  component,
  onUpdate,
  moduleId
}) => {
  const [showAudioUploader, setShowAudioUploader] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const content = {
    title: component.content?.title || '',
    src: component.content?.src || '',
    description: component.content?.description || '',
    duration: component.content?.duration || null,
    autoplay: component.content?.autoplay || false,
    controls: component.content?.controls !== undefined ? component.content.controls : true,
    loop: component.content?.loop || false
  };

  const updateContent = (updates: Partial<AudioContent>) => {
    const newContent = { ...content, ...updates };
    onUpdate({ content: newContent });
  };

  const handleAudioUpload = (fileUrl: string, metadata?: any) => {
    updateContent({ 
      src: fileUrl,
      duration: metadata?.duration || null 
    });
    setShowAudioUploader(false);
  };

  const removeAudio = () => {
    updateContent({ src: '', duration: null });
    setIsPlaying(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const audio = document.getElementById('preview-audio') as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
		<div className="space-y-6">
			<EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{activeTab === "content" && (
				<div className="space-y-6">
					<FormField label="Título del Audio" required>
						<TextInput
							value={content.title}
							onChange={(value) => updateContent({title: value})}
							placeholder="Título del audio"
						/>
					</FormField>

					{/* Archivo de Audio */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Archivo de Audio *
						</label>

						{(!content.src || showAudioUploader) && (
							<div className="mt-4">
								<FileUploader
									componentType="any"
									acceptedTypes={[
										"audio/mpeg",
										"audio/mp3",
										"audio/wav",
										"audio/ogg",
										"audio/aac",
										"audio/m4a",
									]}
									onUploadComplete={handleAudioUpload}
									maxSize={100}
								/>
								{content.src && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setShowAudioUploader(false)}
										className="mt-2"
									>
										Cancelar
									</Button>
								)}
							</div>
						)}

						{content.src && (
							<div className="space-y-4">
								{/* Reproductor inteligente con streaming */}
								<div className="relative">
									<AudioPlayer
										src={content.src}
										title={content.title}
										description={content.description}
										autoPlay={content.autoplay}
										showDownload={true}
										variant="default"
										onPlay={() => setIsPlaying(true)}
										onPause={() => setIsPlaying(false)}
										onEnded={() => setIsPlaying(false)}
									/>

									{/* Botón para remover */}
									<button
										onClick={removeAudio}
										className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
										title="Eliminar audio"
									>
										<X className="w-4 h-4" />
									</button>
								</div>

								<div className="flex space-x-2">
									<Button
										variant="secondary"
										size="sm"
										onClick={() => setShowAudioUploader(true)}
									>
										<Upload className="w-4 h-4 mr-2" />
										Cambiar audio
									</Button>

									{/* Botón temporal de prueba */}
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											const testUrl =
												"https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3";
											updateContent({src: testUrl, title: "Audio de prueba"});
										}}
										className="text-blue-600"
									>
										🧪 Prueba
									</Button>
								</div>
							</div>
            )}
					</div>

					<FormField label="Descripción (opcional)">
						<TextArea
							value={content.description || ""}
							onChange={(value) => updateContent({description: value})}
							rows={4}
							placeholder="Descripción del contenido del audio..."
						/>
						<p className="text-xs text-gray-500 mt-1">
							Describe el contenido del audio para ayudar a los estudiantes
						</p>
					</FormField>
				</div>
			)}

			{activeTab === "settings" && (
				<div className="space-y-6">
					<SettingsSection title="Controles de Reproducción">
						<div className="space-y-4">
							<CheckboxField
								checked={content.controls}
								onChange={(checked) => updateContent({controls: checked})}
								label="Mostrar controles - Permite al usuario controlar la reproducción"
							/>

							<CheckboxField
								checked={content.autoplay}
								onChange={(checked) => updateContent({autoplay: checked})}
								label="Reproducción automática - El audio se reproduce automáticamente"
							/>

							<CheckboxField
								checked={content.loop}
								onChange={(checked) => updateContent({loop: checked})}
								label="Reproducir en bucle - El audio se repite automáticamente"
							/>
						</div>
					</SettingsSection>

					<FormField label="Duración estimada (minutos)">
						<TextInput
							type="number"
							min="0"
							step="0.5"
							value={
								content.duration
									? (Math.round((content.duration / 60) * 10) / 10).toString()
									: ""
							}
							onChange={(value) =>
								updateContent({
									duration: value ? Math.round(parseFloat(value) * 60) : null,
								})
							}
							placeholder="0"
						/>
						<p className="text-xs text-gray-500 mt-1">
							Se detecta automáticamente al subir el audio, pero puedes
							ajustarlo manualmente
						</p>
					</FormField>

					<PreviewSection title="Recomendaciones">
						<div className="space-y-2 text-xs text-gray-600">
							<div className="flex justify-between">
								<span>Formatos recomendados:</span>
								<span>MP3, WAV, OGG</span>
							</div>
							<div className="flex justify-between">
								<span>Calidad recomendada:</span>
								<span>128-320 kbps</span>
							</div>
							<div className="flex justify-between">
								<span>Tamaño máximo:</span>
								<span>100MB</span>
							</div>
							<div className="flex justify-between">
								<span>Frecuencia de muestreo:</span>
								<span>44.1 kHz o superior</span>
							</div>
						</div>
					</PreviewSection>

					<PreviewSection title="♿ Accesibilidad" className="bg-blue-50">
						<div className="text-sm text-blue-700 space-y-2">
							<p>
								• Considera proporcionar transcripciones para estudiantes con
								discapacidades auditivas
							</p>
							<p>• Usa descripciones claras del contenido del audio</p>
							<p>• Evita la reproducción automática si el audio es largo</p>
						</div>
					</PreviewSection>
				</div>
			)}

			{content.src && (
				<PreviewSection title="Vista previa del componente">
					<div className="border border-gray-200 rounded-lg p-4 bg-white">
						<AudioPlayer
							src={content.src}
							title={content.title}
							description={content.description}
							autoPlay={content.autoplay}
							showDownload={false}
							variant="default"
						/>
						{content.duration && (
							<p className="text-xs text-gray-500 mt-2">
								Duración: {formatDuration(content.duration)}
							</p>
						)}
					</div>
				</PreviewSection>
			)}
		</div>
	);
};