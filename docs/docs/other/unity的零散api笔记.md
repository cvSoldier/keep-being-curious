---
title: unity的零散api笔记
date: 2022-08-27
---
### Tilemap.CompressBounds
将 Tilemap 的 origin 和 size 压缩到瓦片所存在的边界。  

![before](/assets/unity/Tilemap.CompressBounds/before.png)
![after](/assets/unity/Tilemap.CompressBounds/after.png)
```c#
void Start()
    {
        _tilemap = GetComponent<Tilemap>();
        Vector3Int startCell = _tilemap.cellBounds.min;
        Vector3Int endCell = _tilemap.cellBounds.max;
        Debug.Log("before compress, startCell" + startCell);
        Debug.Log("before compress, endCell" + endCell);
        
        _tilemap.CompressBounds();
        startCell = _tilemap.cellBounds.min;
        endCell = _tilemap.cellBounds.max;
        Debug.Log("after compress, startCell" + startCell);
        Debug.Log("after compress, endCell" + endCell);
    }
```