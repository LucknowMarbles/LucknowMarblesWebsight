import React from 'react';
import { Button, Tooltip } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  CameraOutlined
} from '@ant-design/icons';

const Warehouse3DControls = ({ onZoomIn, onZoomOut, onReset, onToggleFullscreen, onSnapshot }) => {
  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 flex gap-2">
      <Tooltip title="Zoom In">
        <Button icon={<ZoomInOutlined />} onClick={onZoomIn} />
      </Tooltip>
      <Tooltip title="Zoom Out">
        <Button icon={<ZoomOutOutlined />} onClick={onZoomOut} />
      </Tooltip>
      <Tooltip title="Reset View">
        <Button icon={<ReloadOutlined />} onClick={onReset} />
      </Tooltip>
      <Tooltip title="Fullscreen">
        <Button icon={<FullscreenOutlined />} onClick={onToggleFullscreen} />
      </Tooltip>
      <Tooltip title="Take Snapshot">
        <Button icon={<CameraOutlined />} onClick={onSnapshot} />
      </Tooltip>
    </div>
  );
};

export default Warehouse3DControls; 