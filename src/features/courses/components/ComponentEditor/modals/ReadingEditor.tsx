import React, { useState, useRef, useEffect } from 'react';
import { Type, Bold, Italic, List, Link, AlignLeft, AlignCenter, AlignRight, Shield } from 'lucide-react';
import Button from '../../../../../components/ui/Button/Button';
import { 
  FormField, 
  TextInput, 
  PreviewSection
} from '../shared';
import { sanitizeEducationalHTML, validateHTMLSafety, extractPlainText } from '../../../../../shared/utils/htmlSanitizer';

interface ReadingContent {
  title: string;
  text: string;
  format?: 'html' | 'markdown' | 'plain';
}

interface ComponentData {
  id: string;
  type: string;
  title: string;
  content?: ReadingContent;
  metadata?: any;
}

interface ReadingEditorProps {
  component: ComponentData;
  onUpdate: (updates: Partial<ComponentData>) => void;
  moduleId: string;
}

export const ReadingEditor: React.FC<ReadingEditorProps> = ({
  component,
  onUpdate,
  moduleId
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentFormat, setCurrentFormat] = useState<string>('');
  const [securityWarning, setSecurityWarning] = useState<string>('');
  
  const content = component.content || {
    title: component.title || '',
    text: '',
    format: 'html' as const
  };

  const updateContent = (updates: Partial<ReadingContent>) => {
    const newContent = { ...content, ...updates };
    onUpdate({ content: newContent });
  };

  // Inicializar el editor con el contenido existente
  useEffect(() => {
    if (editorRef.current && content.text) {
      editorRef.current.innerHTML = content.text;
    }
  }, []);

  // Función para manejar cambios en el editor con sanitización
  const handleContentChange = () => {
    if (editorRef.current) {
      const rawHTML = editorRef.current.innerHTML;
      
      // Validar seguridad antes de procesar
      if (!validateHTMLSafety(rawHTML)) {
        setSecurityWarning('⚠️ Contenido potencialmente peligroso detectado y removido por seguridad');
        // Limpiar el editor manteniendo solo el texto
        const safeText = extractPlainText(rawHTML);
        editorRef.current.innerHTML = `<p>${safeText}</p>`;
        updateContent({ text: `<p>${safeText}</p>` });
        return;
      }

      // Sanitizar el contenido de forma segura
      const sanitizedHTML = sanitizeEducationalHTML(rawHTML);
      
      // Solo actualizar si el contenido cambió después de la sanitización
      if (sanitizedHTML !== rawHTML) {
        editorRef.current.innerHTML = sanitizedHTML;
        setSecurityWarning('🛡️ Contenido automaticamente protegido contra ataques de seguridad');
      } else {
        setSecurityWarning(''); // Limpiar advertencia si todo está bien
      }
      
      updateContent({ text: sanitizedHTML });
    }
  };

  // Función para ejecutar comandos de formato
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  // Función para verificar el estado actual del formato
  const updateFormatState = () => {
    const formats = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('insertUnorderedList')) formats.push('ul');
    if (document.queryCommandState('insertOrderedList')) formats.push('ol');
    setCurrentFormat(formats.join(','));
  };

  // Manejar la tecla Enter en listas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const container = range?.commonAncestorContainer;
      
      // Si estamos en una lista y presionamos Enter dos veces, salir de la lista
      if (container && (container.nodeName === 'LI' || container.parentElement?.nodeName === 'LI')) {
        setTimeout(() => {
          const currentElement = selection?.focusNode?.parentElement;
          if (currentElement?.textContent?.trim() === '') {
            // Si el elemento actual está vacío después de Enter, salir de la lista
            execCommand('outdent');
          }
        }, 10);
      }
    }
    
    setTimeout(updateFormatState, 10);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleContentChange();
  };

  const insertLink = () => {
    const url = prompt('Ingresa la URL:');
    if (url) {
      const linkText = prompt('Texto del enlace:') || url;
      execCommand('createLink', url);
    }
  };

  return (
    <div className="space-y-6">
      <FormField label="Título del Contenido (opcional)">
        <TextInput
          value={content.title || ''}
          onChange={(value) => updateContent({ title: value })}
          placeholder="Título del contenido de lectura"
        />
      </FormField>

      <div className="space-y-4">
        {/* Indicador de seguridad */}
        {securityWarning && (
          <div className={`p-3 rounded-lg border ${
            securityWarning.includes('peligroso') 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">{securityWarning}</span>
            </div>
          </div>
        )}

        {/* Toolbar intuitiva */}
        <div className="flex flex-wrap items-center gap-1 p-3 bg-gray-50 border border-gray-300 rounded-t-lg">
          {/* Títulos */}
          <select 
            className="px-3 py-1 border border-gray-200 rounded text-sm"
            onChange={(e) => {
              if (e.target.value) {
                execCommand('formatBlock', e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="">Estilo</option>
            <option value="h2">Título Principal</option>
            <option value="h3">Subtítulo</option>
            <option value="p">Párrafo</option>
          </select>
          
          <div className="border-l border-gray-300 mx-2 h-6" />
          
          {/* Formato básico */}
          <Button
            variant={currentFormat.includes('bold') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => execCommand('bold')}
            title="Negrita (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant={currentFormat.includes('italic') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => execCommand('italic')}
            title="Cursiva (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-300 mx-2 h-6" />
          
          {/* Listas */}
          <Button
            variant={currentFormat.includes('ul') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            title="Lista con viñetas"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={currentFormat.includes('ol') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => execCommand('insertOrderedList')}
            title="Lista numerada"
          >
            <span className="text-sm font-bold">1.</span>
          </Button>
          
          <div className="border-l border-gray-300 mx-2 h-6" />
          
          {/* Alineación */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyLeft')}
            title="Alinear izquierda"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyCenter')}
            title="Centrar"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyRight')}
            title="Alinear derecha"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          
          <div className="border-l border-gray-300 mx-2 h-6" />
          
          {/* Enlace */}
          <Button
            variant="ghost"
            size="sm"
            onClick={insertLink}
            title="Insertar enlace"
          >
            <Link className="w-4 h-4" />
          </Button>
        </div>

        {/* Editor WYSIWYG */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning={true}
          className="w-full min-h-[400px] px-4 py-3 border border-gray-300 border-t-0 rounded-b-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none prose max-w-none"
          style={{ 
            fontSize: '16px', 
            lineHeight: '1.6',
            backgroundColor: 'white'
          }}
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onKeyUp={updateFormatState}
          onMouseUp={updateFormatState}
          onPaste={handlePaste}
          placeholder="Comienza a escribir tu contenido aquí...

Consejos:
• Selecciona texto y usa los botones para formato
• Las listas se crean automáticamente con Enter
• Presiona Enter dos veces para salir de una lista
• Ctrl+B para negrita, Ctrl+I para cursiva"
        />
      </div>

      <PreviewSection title="Estadísticas del contenido">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {extractPlainText(content.text || '').length}
            </div>
            <div className="text-gray-500">Caracteres</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {extractPlainText(content.text || '').split(/\s+/).filter(word => word.length > 0).length}
            </div>
            <div className="text-gray-500">Palabras</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {Math.ceil(extractPlainText(content.text || '').split(/\s+/).filter(word => word.length > 0).length / 200)}
            </div>
            <div className="text-gray-500">Min. lectura</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-xs text-green-600">
          <Shield className="w-3 h-3" />
          <span>Contenido automaticamente protegido contra ataques de seguridad</span>
        </div>
      </PreviewSection>
    </div>
  );
};